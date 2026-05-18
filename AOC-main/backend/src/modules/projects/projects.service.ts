import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';

export interface CreateProjectData {
  name: string;
  description?: string;
  githubRepo?: string;
  demoUrl?: string;
  techStack?: string[];
  ownerTeamId?: string;
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ── LIST PROJECTS ─────────────────────────────────────────────────────

  async listProjects(params: {
    status?: ProjectStatus;
    needsContributors?: boolean;
    search?: string;
    page?: any;
    limit?: any;
  }) {
    const { status, needsContributors, search, page = 1, limit = 20 } = params;
    const p = Number(page) || 1;
    const l = Number(limit) || 20;

    const where: any = { visibility: 'public' };

    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (needsContributors) {
      where.needs = { some: { isFilled: false } };
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          ownerTeam: { select: { id: true, name: true } },
          members: {
            include: {
              user: { select: { id: true, username: true, avatarUrl: true } },
            },
          },
          needs: { where: { isFilled: false } },
          _count: { select: { members: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  // ── GET PROJECT ───────────────────────────────────────────────────────

  async getProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        ownerTeam: {
          include: {
            leader: { select: { id: true, username: true, fullName: true } },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                skills: { include: { skill: true } },
              },
            },
          },
        },
        needs: true,
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  // ── CREATE PROJECT ────────────────────────────────────────────────────

  async createProject(userId: string, data: CreateProjectData) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          description: data.description,
          githubRepo: data.githubRepo,
          demoUrl: data.demoUrl,
          techStack: data.techStack ?? [],
          ownerTeamId: data.ownerTeamId,
          status: 'idea',
        },
      });

      // Add creator as first contributor
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: 'owner',
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          userId,
          activityType: 'created_project',
          entityType: 'project',
          entityId: project.id,
          metadata: { projectName: project.name },
        },
      });

      return project;
    });
  }

  // ── UPDATE PROJECT ────────────────────────────────────────────────────

  async updateProject(projectId: string, userId: string, data: Partial<CreateProjectData> & { status?: ProjectStatus }) {
    // Verify ownership
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException('Only the project owner can update');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  // ── ADD CONTRIBUTOR NEED ──────────────────────────────────────────────

  async addNeed(projectId: string, userId: string, data: { roleTitle: string; description?: string; skills?: string[] }) {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!membership) throw new ForbiddenException('Not a project member');

    return this.prisma.projectNeed.create({
      data: {
        projectId,
        roleTitle: data.roleTitle,
        description: data.description,
        skills: data.skills ?? [],
      },
    });
  }
}
