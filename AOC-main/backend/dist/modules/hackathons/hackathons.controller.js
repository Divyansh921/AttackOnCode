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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackathonsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hackathons_service_1 = require("./hackathons.service");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let HackathonsController = class HackathonsController {
    constructor(hackathonsService) {
        this.hackathonsService = hackathonsService;
    }
    async list(filter, page, limit) {
        return this.hackathonsService.listHackathons(filter, page, limit);
    }
    async getHackathon(id) {
        return this.hackathonsService.getHackathon(id);
    }
    async create(data) {
        return this.hackathonsService.createHackathon(data);
    }
    async expressInterest(hackathonId, userId) {
        return this.hackathonsService.expressInterest(hackathonId, userId);
    }
    async registerTeam(hackathonId, teamId, userId) {
        return this.hackathonsService.registerTeam(hackathonId, teamId, userId);
    }
};
exports.HackathonsController = HackathonsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List hackathons with filter' }),
    (0, swagger_1.ApiQuery)({ name: 'filter', enum: ['upcoming', 'ongoing', 'past'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], HackathonsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get hackathon details with teams and interested builders' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HackathonsController.prototype, "getHackathon", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a hackathon listing' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HackathonsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/interest'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Express interest in a hackathon' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HackathonsController.prototype, "expressInterest", null);
__decorate([
    (0, common_1.Post)(':id/register'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register team for a hackathon (leader only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('teamId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], HackathonsController.prototype, "registerTeam", null);
exports.HackathonsController = HackathonsController = __decorate([
    (0, swagger_1.ApiTags)('hackathons'),
    (0, common_1.Controller)('hackathons'),
    __metadata("design:paramtypes", [hackathons_service_1.HackathonsService])
], HackathonsController);
//# sourceMappingURL=hackathons.controller.js.map