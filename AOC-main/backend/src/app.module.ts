import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Infrastructure
import { PrismaModule } from './common/prisma/prisma.module';

// Domain Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { HackathonsModule } from './modules/hackathons/hackathons.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ActivityModule } from './modules/activity/activity.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Realtime
import { EventsGateway } from './websocket/events.gateway';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 1 minute window
      limit: 100,   // 100 requests per window
    }]),

    // Infrastructure
    PrismaModule,

    // Domain Modules
    AuthModule,
    UsersModule,
    TeamsModule,
    HackathonsModule,
    ProjectsModule,
    ActivityModule,
    NotificationsModule,
  ],
  providers: [EventsGateway],
})
export class AppModule {}
