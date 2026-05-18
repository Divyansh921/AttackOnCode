import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TeamStatus, TeamVisibility } from '@prisma/client';

// ── INTERFACES ──────────────────────────────────────────────────────────

export interface CreateTeamData {
  name: string;
  description?: string;
  maxMembers?: number;
  visibility?: TeamVisibility;
}

export interface CreateOpeningData {
  title: string;
  description?: string;
  requiredSkills?: string[];
  slots?: number;
}

export interface TeamSearchParams {
  search?: string;
  status?: TeamStatus;
  needsRole?: string;
  hackathonId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  // ── CREATE TEAM ───────────────────────────────────────────────────────

  async createTeam(leaderId: string, data: CreateTeamData) {
    return this.prisma.$transaction(async (tx) => {
      // Create team
      const team = await tx.team.create({
        data: {
          name: data.name,
          description: data.description,
          leaderId,
          maxMembers: data.maxMembers ?? 6,
          visibility: data.visibility ?? 'public',
          status: 'recruiting',
        },
      });

      // Auto-add leader as member with 'leader' role
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: leaderId,
          role: 'leader',
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          userId: leaderId,
          activityType: 'created_team',
          entityType: 'team',
          entityId: team.id,
          metadata: { teamName: team.name },
        },
      });

      return team;
    });
  }

  // ── SEARCH TEAMS ──────────────────────────────────────────────────────

  async searchTeams(params: TeamSearchParams) {
    const { search, status, needsRole, hackathonId, page = 1, limit = 20 } = params;
    const p = Number(page) || 1;
    const l = Number(limit) || 20;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    // Filter teams that need a specific role
    if (needsRole) {
      where.openings = {
        some: {
          status: 'open',
          title: { contains: needsRole, mode: 'insensitive' },
        },
      };
    }

    // Filter teams targeting a specific hackathon
    if (hackathonId) {
      where.hackathons = {
        some: { hackathonId },
      };
    }

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          maxMembers: true,
          status: true,
          createdAt: true,
          leader: {
            select: { id: true, username: true, fullName: true, avatarUrl: true },
          },
          members: {
            select: {
              role: true,
              user: {
                select: { id: true, username: true, avatarUrl: true },
              },
            },
          },
          openings: {
            where: { status: 'open' },
            select: {
              id: true,
              title: true,
              requiredSkills: true,
              slots: true,
            },
          },
          hackathons: {
            select: {
              status: true,
              hackathon: {
                select: { id: true, name: true, startDate: true },
              },
            },
          },
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.team.count({ where }),
    ]);

    return {
      data: teams,
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  // ── GET TEAM ──────────────────────────────────────────────────────────

  async getTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        leader: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                skills: {
                  include: { skill: true },
                },
              },
            },
          },
        },
        openings: true,
        hackathons: {
          include: { hackathon: true, project: true },
        },
        projects: {
          select: { id: true, name: true, status: true, techStack: true },
        },
      },
    });

    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  // ── CREATE OPENING ────────────────────────────────────────────────────

  async createOpening(teamId: string, userId: string, data: CreateOpeningData) {
    await this.assertTeamLeader(teamId, userId);

    return this.prisma.teamOpening.create({
      data: {
        teamId,
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills ?? [],
        slots: data.slots ?? 1,
        status: 'open',
      },
    });
  }

  // ── APPLY TO TEAM ─────────────────────────────────────────────────────

  async applyToTeam(openingId: string, userId: string, message?: string) {
    const opening = await this.prisma.teamOpening.findUnique({
      where: { id: openingId },
      include: { team: { include: { members: true } } },
    });

    if (!opening) throw new NotFoundException('Opening not found');
    if (opening.status !== 'open') throw new BadRequestException('This position is no longer open');

    // Check if already a member
    const isMember = opening.team.members.some((m) => m.userId === userId);
    if (isMember) throw new ConflictException('You are already a member of this team');

    // Check for existing application
    const existing = await this.prisma.teamApplication.findUnique({
      where: { openingId_userId: { openingId, userId } },
    });
    if (existing) throw new ConflictException('You already applied to this position');

    const application = await this.prisma.teamApplication.create({
      data: {
        openingId,
        userId,
        message,
        status: 'pending',
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        userId,
        activityType: 'applied_to_team',
        entityType: 'team',
        entityId: opening.teamId,
        metadata: { teamName: opening.team.name, position: opening.title },
      },
    });

    return application;
  }

  // ── ACCEPT APPLICATION ────────────────────────────────────────────────

  async acceptApplication(applicationId: string, leaderId: string) {
    const application = await this.prisma.teamApplication.findUnique({
      where: { id: applicationId },
      include: {
        opening: { include: { team: { include: { members: true } } } },
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    await this.assertTeamLeader(application.opening.teamId, leaderId);

    const team = application.opening.team;

    // Check team capacity
    if (team.members.length >= team.maxMembers) {
      throw new BadRequestException('Team is already at maximum capacity');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update application status
      await tx.teamApplication.update({
        where: { id: applicationId },
        data: { status: 'accepted', reviewedAt: new Date() },
      });

      // Add as team member
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: application.userId,
          role: application.opening.title,
        },
      });

      // Decrement opening slots
      const updatedSlots = application.opening.slots - 1;
      await tx.teamOpening.update({
        where: { id: application.openingId },
        data: {
          slots: updatedSlots,
          status: updatedSlots <= 0 ? 'filled' : 'open',
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          userId: application.userId,
          activityType: 'joined_team',
          entityType: 'team',
          entityId: team.id,
          metadata: { teamName: team.name, role: application.opening.title },
        },
      });

      // Create notification for the applicant
      await tx.notification.create({
        data: {
          userId: application.userId,
          type: 'application_accepted',
          title: `Welcome to ${team.name}!`,
          message: `Your application for ${application.opening.title} has been accepted.`,
          link: `/teams/${team.id}`,
        },
      });

      return { status: 'accepted', teamId: team.id };
    });
  }

  // ── REJECT APPLICATION ────────────────────────────────────────────────

  async rejectApplication(applicationId: string, leaderId: string) {
    const application = await this.prisma.teamApplication.findUnique({
      where: { id: applicationId },
      include: { opening: true },
    });

    if (!application) throw new NotFoundException('Application not found');
    await this.assertTeamLeader(application.opening.teamId, leaderId);

    return this.prisma.teamApplication.update({
      where: { id: applicationId },
      data: { status: 'rejected', reviewedAt: new Date() },
    });
  }

  // ── HELPERS ───────────────────────────────────────────────────────────

  private async assertTeamLeader(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { leaderId: true },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== userId) {
      throw new ForbiddenException('Only the team leader can perform this action');
    }
  }
}
