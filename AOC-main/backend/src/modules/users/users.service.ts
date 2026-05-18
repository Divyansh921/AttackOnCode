import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AvailabilityStatus, SkillCategory } from '@prisma/client';

// ── QUERY INTERFACES ────────────────────────────────────────────────────

export interface BuilderSearchParams {
  search?: string;
  skills?: string[];
  availability?: AvailabilityStatus;
  lookingForTeam?: boolean;
  category?: SkillCategory;
  college?: string;
  page?: number;
  limit?: number;
}

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  college?: string;
  year?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  lookingForTeam?: boolean;
  availabilityStatus?: AvailabilityStatus;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ── BUILDER DISCOVERY ─────────────────────────────────────────────────

  async searchBuilders(params: BuilderSearchParams) {
    const {
      search,
      skills,
      availability,
      lookingForTeam,
      category,
      college,
      page: rawPage = 1,
      limit: rawLimit = 20,
    } = params;

    const page = Number(rawPage) || 1;
    const limit = Number(rawLimit) || 20;

    const where: any = {};

    // Text search (username or name)
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Availability filter
    if (availability) {
      where.availabilityStatus = availability;
    }

    // Looking for team filter
    if (lookingForTeam !== undefined) {
      where.lookingForTeam = lookingForTeam;
    }

    // College filter
    if (college) {
      where.college = { contains: college, mode: 'insensitive' };
    }

    // Skill filter: users who have any of the specified skills
    if (skills && skills.length > 0) {
      where.skills = {
        some: {
          skill: { name: { in: skills, mode: 'insensitive' } },
        },
      };
    }

    // Category filter
    if (category) {
      where.skills = {
        ...where.skills,
        some: {
          ...where.skills?.some,
          skill: {
            ...where.skills?.some?.skill,
            category,
          },
        },
      };
    }

    const [builders, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
          college: true,
          lookingForTeam: true,
          availabilityStatus: true,
          skills: {
            select: {
              proficiency: true,
              skill: { select: { name: true, category: true } },
            },
          },
          stats: {
            select: {
              xp: true,
              hackathonsJoined: true,
              projectsCompleted: true,
              contributions: true,
              wins: true,
            },
          },
          _count: {
            select: {
              teamMemberships: true,
              badges: true,
            },
          },
        },
        orderBy: [
          { stats: { xp: 'desc' } },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: builders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── GET PROFILE ───────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        college: true,
        year: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        lookingForTeam: true,
        availabilityStatus: true,
        createdAt: true,
        skills: {
          select: {
            proficiency: true,
            yearsExperience: true,
            skill: { select: { id: true, name: true, category: true } },
          },
        },
        stats: true,
        preferences: true,
        badges: {
          select: {
            earnedAt: true,
            badge: { select: { id: true, name: true, description: true, iconUrl: true } },
          },
          orderBy: { earnedAt: 'desc' },
        },
        teamMemberships: {
          select: {
            role: true,
            team: {
              select: { id: true, name: true, status: true },
            },
          },
        },
        projectMemberships: {
          select: {
            role: true,
            project: {
              select: { id: true, name: true, status: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Builder not found');
    }

    return user;
  }

  // ── UPDATE PROFILE ────────────────────────────────────────────────────

  async updateProfile(userId: string, data: UpdateProfileData) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        fullName: true,
        bio: true,
        lookingForTeam: true,
        availabilityStatus: true,
      },
    });

    return user;
  }

  // ── UPDATE SKILLS ─────────────────────────────────────────────────────

  async updateSkills(
    userId: string,
    skills: Array<{ skillId: string; proficiency: string; yearsExperience?: number }>,
  ) {
    // Delete existing and replace (upsert pattern)
    await this.prisma.$transaction(async (tx) => {
      await tx.userSkill.deleteMany({ where: { userId } });
      await tx.userSkill.createMany({
        data: skills.map((s) => ({
          userId,
          skillId: s.skillId,
          proficiency: s.proficiency as any,
          yearsExperience: s.yearsExperience ?? 0,
        })),
      });
    });

    return this.prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });
  }

  // ── GET ALL SKILLS (for filters) ──────────────────────────────────────

  async getAllSkills(category?: SkillCategory) {
    return this.prisma.skill.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }
}
