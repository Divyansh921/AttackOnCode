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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ActivityService = class ActivityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGlobalFeed(page = 1, limit = 20) {
        const p = Number(page) || 1;
        const l = Number(limit) || 20;
        const [activities, total] = await Promise.all([
            this.prisma.activity.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (p - 1) * l,
                take: l,
            }),
            this.prisma.activity.count(),
        ]);
        return {
            data: activities,
            meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
        };
    }
    async getUserFeed(userId, page = 1, limit = 20) {
        const p = Number(page) || 1;
        const l = Number(limit) || 20;
        const [activities, total] = await Promise.all([
            this.prisma.activity.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: (p - 1) * l,
                take: l,
            }),
            this.prisma.activity.count({ where: { userId } }),
        ]);
        return {
            data: activities,
            meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
        };
    }
    async getEntityFeed(entityType, entityId, page = 1, limit = 20) {
        const p = Number(page) || 1;
        const l = Number(limit) || 20;
        const [activities, total] = await Promise.all([
            this.prisma.activity.findMany({
                where: { entityType, entityId },
                include: {
                    user: {
                        select: { id: true, username: true, fullName: true, avatarUrl: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (p - 1) * l,
                take: l,
            }),
            this.prisma.activity.count({ where: { entityType, entityId } }),
        ]);
        return {
            data: activities,
            meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
        };
    }
    async log(userId, activityType, entityType, entityId, metadata = {}) {
        return this.prisma.activity.create({
            data: {
                userId,
                activityType,
                entityType,
                entityId,
                metadata,
            },
        });
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map