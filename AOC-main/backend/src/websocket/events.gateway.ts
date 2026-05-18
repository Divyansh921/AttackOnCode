import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

/**
 * WebSocket Gateway — Realtime Ecosystem Layer with Authentication
 *
 * Security: Every socket connection must authenticate with a valid JWT.
 * Unauthenticated connections are disconnected immediately.
 *
 * Events emitted to clients:
 * - 'activity:new'       — new global activity
 * - 'notification:new'   — new notification for user
 * - 'team:update'        — team membership/status change
 * - 'presence:update'    — online user count change
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected users: userId -> Set of socketIds
  private onlineUsers = new Map<string, Set<string>>();
  // Track socket -> userId mapping for cleanup
  private socketUserMap = new Map<string, string>();

  constructor(private config: ConfigService) {}

  // ── AUTHENTICATED CONNECTION ──────────────────────────────────────────

  handleConnection(client: Socket) {
    try {
      // Extract JWT from auth header or query param
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1] ||
        (client.handshake.query?.token as string);

      if (!token) {
        console.log(`[WS] Rejected: no token (${client.id})`);
        client.disconnect(true);
        return;
      }

      const secret = this.config.get<string>('JWT_SECRET');
      const payload = jwt.verify(token, secret!) as any;

      // Attach user info to socket
      (client as any).userId = payload.sub;
      (client as any).username = payload.username;
      (client as any).role = payload.role;

      // Track presence
      const userId = payload.sub;
      this.socketUserMap.set(client.id, userId);

      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(client.id);

      // Auto-join user room for targeted notifications
      client.join(`user:${userId}`);

      this.broadcastPresence();
      console.log(`[WS] Authenticated: ${payload.username} (${client.id})`);
    } catch (err) {
      console.log(`[WS] Auth failed: ${(err as Error).message} (${client.id})`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
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

  // ── CLIENT EVENTS ────────────────────────────────────────────────────

  @SubscribeMessage('team:join')
  handleTeamJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { teamId: string },
  ) {
    client.join(`team:${data.teamId}`);
  }

  @SubscribeMessage('team:leave')
  handleTeamLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { teamId: string },
  ) {
    client.leave(`team:${data.teamId}`);
  }

  // ── SERVER-SIDE EMITTERS ──────────────────────────────────────────────

  /** Broadcast a new activity to all connected clients */
  emitActivity(activity: any) {
    this.server.emit('activity:new', activity);
  }

  /** Send a notification to a specific user */
  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  /** Broadcast a team update to all members in the team room */
  emitTeamUpdate(teamId: string, event: string, data: any) {
    this.server.to(`team:${teamId}`).emit('team:update', { event, data });
  }

  // ── PRESENCE ──────────────────────────────────────────────────────────

  private broadcastPresence() {
    this.server.emit('presence:update', {
      onlineCount: this.onlineUsers.size,
      onlineUserIds: Array.from(this.onlineUsers.keys()),
    });
  }

  getOnlineCount(): number {
    return this.onlineUsers.size;
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
