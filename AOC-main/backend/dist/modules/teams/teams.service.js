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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let TeamsService = class TeamsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTeam(leaderId, data) {
        return this.prisma.$transaction(async (tx) => {
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
            await tx.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: leaderId,
                    role: 'leader',
                },
            });
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
    async searchTeams(params) {
        const { search, status, needsRole, hackathonId, page = 1, limit = 20 } = params;
        const p = Number(page) || 1;
        const l = Number(limit) || 20;
        const where = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        if (status) {
            where.status = status;
        }
        if (needsRole) {
            where.openings = {
                some: {
                    status: 'open',
                    title: { contains: needsRole, mode: 'insensitive' },
                },
            };
        }
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
    async getTeam(teamId) {
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
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        return team;
    }
    async createOpening(teamId, userId, data) {
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
    async applyToTeam(openingId, userId, message) {
        const opening = await this.prisma.teamOpening.findUnique({
            where: { id: openingId },
            include: { team: { include: { members: true } } },
        });
        if (!opening)
            throw new common_1.NotFoundException('Opening not found');
        if (opening.status !== 'open')
            throw new common_1.BadRequestException('This position is no longer open');
        const isMember = opening.team.members.some((m) => m.userId === userId);
        if (isMember)
            throw new common_1.ConflictException('You are already a member of this team');
        const existing = await this.prisma.teamApplication.findUnique({
            where: { openingId_userId: { openingId, userId } },
        });
        if (existing)
            throw new common_1.ConflictException('You already applied to this position');
        const application = await this.prisma.teamApplication.create({
            data: {
                openingId,
                userId,
                message,
                status: 'pending',
            },
        });
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
    async acceptApplication(applicationId, leaderId) {
        const application = await this.prisma.teamApplication.findUnique({
            where: { id: applicationId },
            include: {
                opening: { include: { team: { include: { members: true } } } },
            },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        await this.assertTeamLeader(application.opening.teamId, leaderId);
        const team = application.opening.team;
        if (team.members.length >= team.maxMembers) {
            throw new common_1.BadRequestException('Team is already at maximum capacity');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.teamApplication.update({
                where: { id: applicationId },
                data: { status: 'accepted', reviewedAt: new Date() },
            });
            await tx.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: application.userId,
                    role: application.opening.title,
                },
            });
            const updatedSlots = application.opening.slots - 1;
            await tx.teamOpening.update({
                where: { id: application.openingId },
                data: {
                    slots: updatedSlots,
                    status: updatedSlots <= 0 ? 'filled' : 'open',
                },
            });
            await tx.activity.create({
                data: {
                    userId: application.userId,
                    activityType: 'joined_team',
                    entityType: 'team',
                    entityId: team.id,
                    metadata: { teamName: team.name, role: application.opening.title },
                },
            });
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
    async rejectApplication(applicationId, leaderId) {
        const application = await this.prisma.teamApplication.findUnique({
            where: { id: applicationId },
            include: { opening: true },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        await this.assertTeamLeader(application.opening.teamId, leaderId);
        return this.prisma.teamApplication.update({
            where: { id: applicationId },
            data: { status: 'rejected', reviewedAt: new Date() },
        });
    }
    async assertTeamLeader(teamId, userId) {
        const team = await this.prisma.team.findUnique({
            where: { id: teamId },
            select: { leaderId: true },
        });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        if (team.leaderId !== userId) {
            throw new common_1.ForbiddenException('Only the team leader can perform this action');
        }
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map