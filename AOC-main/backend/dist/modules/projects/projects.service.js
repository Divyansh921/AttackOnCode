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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listProjects(params) {
        const { status, needsContributors, search, page = 1, limit = 20 } = params;
        const p = Number(page) || 1;
        const l = Number(limit) || 20;
        const where = { visibility: 'public' };
        if (status)
            where.status = status;
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
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
    async getProject(id) {
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
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    async createProject(userId, data) {
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
            await tx.projectMember.create({
                data: {
                    projectId: project.id,
                    userId,
                    role: 'owner',
                },
            });
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
    async updateProject(projectId, userId, data) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership || membership.role !== 'owner') {
            throw new common_1.ForbiddenException('Only the project owner can update');
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data,
        });
    }
    async addNeed(projectId, userId, data) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership)
            throw new common_1.ForbiddenException('Not a project member');
        return this.prisma.projectNeed.create({
            data: {
                projectId,
                roleTitle: data.roleTitle,
                description: data.description,
                skills: data.skills ?? [],
            },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map