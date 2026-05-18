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
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
let EventsGateway = class EventsGateway {
    constructor(config) {
        this.config = config;
        this.onlineUsers = new Map();
        this.socketUserMap = new Map();
    }
    handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1] ||
                client.handshake.query?.token;
            if (!token) {
                console.log(`[WS] Rejected: no token (${client.id})`);
                client.disconnect(true);
                return;
            }
            const secret = this.config.get('JWT_SECRET');
            const payload = jwt.verify(token, secret);
            client.userId = payload.sub;
            client.username = payload.username;
            client.role = payload.role;
            const userId = payload.sub;
            this.socketUserMap.set(client.id, userId);
            if (!this.onlineUsers.has(userId)) {
                this.onlineUsers.set(userId, new Set());
            }
            this.onlineUsers.get(userId).add(client.id);
            client.join(`user:${userId}`);
            this.broadcastPresence();
            console.log(`[WS] Authenticated: ${payload.username} (${client.id})`);
        }
        catch (err) {
            console.log(`[WS] Auth failed: ${err.message} (${client.id})`);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        const userId = this.socketUserMap.get(client.id);
        if (userId) {
            this.socketUserMap.delete(client.id);
            const sockets = this.onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.onlineUsers.delete(userId);
                    this.broadcastPresence();
                }
            }
        }
        console.log(`[WS] Disconnected: ${client.id}`);
    }
    handleTeamJoin(client, data) {
        client.join(`team:${data.teamId}`);
    }
    handleTeamLeave(client, data) {
        client.leave(`team:${data.teamId}`);
    }
    emitActivity(activity) {
        this.server.emit('activity:new', activity);
    }
    emitNotification(userId, notification) {
        this.server.to(`user:${userId}`).emit('notification:new', notification);
    }
    emitTeamUpdate(teamId, event, data) {
        this.server.to(`team:${teamId}`).emit('team:update', { event, data });
    }
    broadcastPresence() {
        this.server.emit('presence:update', {
            onlineCount: this.onlineUsers.size,
            onlineUserIds: Array.from(this.onlineUsers.keys()),
        });
    }
    getOnlineCount() {
        return this.onlineUsers.size;
    }
    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('team:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleTeamJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('team:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleTeamLeave", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/ws',
    }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map