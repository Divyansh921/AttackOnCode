import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateHackathonData {
  name: string;
  organizer?: string;
  mode?: 'online' | 'offline' | 'hybrid';
  location?: string;
  registrationDeadline?: Date;
  startDate: Date;
  endDate: Date;
  prizePool?: string;
  websiteUrl?: string;
  description?: string;
  maxTeamSize?: number;
  minTeamSize?: number;
  themes?: string[];
}

@Injectable()
export class HackathonsService {
  constructor(private prisma: PrismaService) {}

  // ── LIST HACKATHONS ───────────────────────────────────────────────────

  async listHackathons(filter: 'upcoming' | 'ongoing' | 'past' = 'upcoming', page: any = 1, limit: any = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    
    const now = new Date();
    const where: any = {};

    if (filter === 'upcoming') {
      where.startDate = { gt: now };
    } else if (filter === 'ongoing') {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else {
      where.endDate = { lt: now };
    }

    const [hackathons, total] = await Promise.all([
      this.prisma.hackathon.findMany({
        where,
        include: {
          _count: { select: { teams: true, interests: true } },
        },
        orderBy: { startDate: filter === 'past' ? 'desc' : 'asc' },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.hackathon.count({ where }),
    ]);

    return {
      data: hackathons.map((h) => ({
        ...h,
        teamsForming: h._count.teams,
        buildersInterested: h._count.interests,
      })),
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  // ── GET HACKATHON ─────────────────────────────────────────────────────

  async getHackathon(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: {
              include: {
                leader: { select: { id: true, username: true, fullName: true } },
                members: {
                  include: {
                    user: { select: { id: true, username: true, avatarUrl: true } },
                  },
                },
                openings: { where: { status: 'open' } },
              },
            },
          },
        },
        interests: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                lookingForTeam: true,
              },
            },
          },
        },
        _count: { select: { teams: true, interests: true } },
      },
    });

    if (!hackathon) throw new NotFoundException('Hackathon not found');
    return hackathon;
  }

  // ── CREATE HACKATHON ──────────────────────────────────────────────────

  async createHackathon(data: CreateHackathonData) {
    return this.prisma.hackathon.create({
      data: {
        ...data,
        mode: data.mode ?? 'offline',
        themes: data.themes ?? [],
      },
    });
  }

  // ── EXPRESS INTEREST ──────────────────────────────────────────────────

  async expressInterest(hackathonId: string, userId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) throw new NotFoundException('Hackathon not found');

    const existing = await this.prisma.userHackathonInterest.findUnique({
      where: { userId_hackathonId: { userId, hackathonId } },
    });
    if (existing) throw new ConflictException('Already expressed interest');

    await this.prisma.userHackathonInterest.create({
      data: { userId, hackathonId },
    });

    return { status: 'interested', hackathonId };
  }

  // ── REGISTER TEAM ─────────────────────────────────────────────────────

  async registerTeam(hackathonId: string, teamId: string, userId: string) {
    // Verify user is team leader
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.leaderId !== userId) {
      throw new NotFoundException('Team not found or you are not the leader');
    }

    const existing = await this.prisma.teamHackathon.findUnique({
      where: { teamId_hackathonId: { teamId, hackathonId } },
    });
    if (existing) throw new ConflictException('Team already registered');

    const registration = await this.prisma.teamHackathon.create({
      data: { teamId, hackathonId, status: 'registered' },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        userId,
        activityType: 'registered_hackathon',
        entityType: 'hackathon',
        entityId: hackathonId,
        metadata: { teamName: team.name },
      },
    });

    return registration;
  }
}
