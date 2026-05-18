import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private config;
    server: Server;
    private onlineUsers;
    private socketUserMap;
    constructor(config: ConfigService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleTeamJoin(client: Socket, data: {
        teamId: string;
    }): void;
    handleTeamLeave(client: Socket, data: {
        teamId: string;
    }): void;
    emitActivity(activity: any): void;
    emitNotification(userId: string, notification: any): void;
    emitTeamUpdate(teamId: string, event: string, data: any): void;
    private broadcastPresence;
    getOnlineCount(): number;
    isUserOnline(userId: string): boolean;
}
