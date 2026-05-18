"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchBuilders(params) {
        const { search, skills, availability, lookingForTeam, category, college, page: rawPage = 1, limit: rawLimit = 20, } = params;
        const page = Number(rawPage) || 1;
        const limit = Number(rawLimit) || 20;
        const where = {};
        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (availability) {
            where.availabilityStatus = availability;
        }
        if (lookingForTeam !== undefined) {
            where.lookingForTeam = lookingForTeam;
        }
        if (college) {
            where.college = { contains: college, mode: 'insensitive' };
        }
        if (skills && skills.length > 0) {
            where.skills = {
                some: {
                    skill: { name: { in: skills, mode: 'insensitive' } },
                },
            };
        }
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
    async getProfile(userId) {
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
            throw new common_1.NotFoundException('Builder not found');
        }
        return user;
    }
    async updateProfile(userId, data) {
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
    async updateSkills(userId, skills) {
        await this.prisma.$transaction(async (tx) => {
            await tx.userSkill.deleteMany({ where: { userId } });
            await tx.userSkill.createMany({
                data: skills.map((s) => ({
                    userId,
                    skillId: s.skillId,
                    proficiency: s.proficiency,
                    yearsExperience: s.yearsExperience ?? 0,
                })),
            });
        });
        return this.prisma.userSkill.findMany({
            where: { userId },
            include: { skill: true },
        });
    }
    async getAllSkills(category) {
        return this.prisma.skill.findMany({
            where: category ? { category } : undefined,
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map