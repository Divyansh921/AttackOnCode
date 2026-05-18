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
exports.HackathonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let HackathonsService = class HackathonsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listHackathons(filter = 'upcoming', page = 1, limit = 20) {
        const p = Number(page) || 1;
        const l = Number(limit) || 20;
        const now = new Date();
        const where = {};
        if (filter === 'upcoming') {
            where.startDate = { gt: now };
        }
        else if (filter === 'ongoing') {
            where.startDate = { lte: now };
            where.endDate = { gte: now };
        }
        else {
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
    async getHackathon(id) {
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
        if (!hackathon)
            throw new common_1.NotFoundException('Hackathon not found');
        return hackathon;
    }
    async createHackathon(data) {
        return this.prisma.hackathon.create({
            data: {
                ...data,
                mode: data.mode ?? 'offline',
                themes: data.themes ?? [],
            },
        });
    }
    async expressInterest(hackathonId, userId) {
        const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
        if (!hackathon)
            throw new common_1.NotFoundException('Hackathon not found');
        const existing = await this.prisma.userHackathonInterest.findUnique({
            where: { userId_hackathonId: { userId, hackathonId } },
        });
        if (existing)
            throw new common_1.ConflictException('Already expressed interest');
        await this.prisma.userHackathonInterest.create({
            data: { userId, hackathonId },
        });
        return { status: 'interested', hackathonId };
    }
    async registerTeam(hackathonId, teamId, userId) {
        const team = await this.prisma.team.findUnique({ where: { id: teamId } });
        if (!team || team.leaderId !== userId) {
            throw new common_1.NotFoundException('Team not found or you are not the leader');
        }
        const existing = await this.prisma.teamHackathon.findUnique({
            where: { teamId_hackathonId: { teamId, hackathonId } },
        });
        if (existing)
            throw new common_1.ConflictException('Team already registered');
        const registration = await this.prisma.teamHackathon.create({
            data: { teamId, hackathonId, status: 'registered' },
        });
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
};
exports.HackathonsService = HackathonsService;
exports.HackathonsService = HackathonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HackathonsService);
//# sourceMappingURL=hackathons.service.js.map