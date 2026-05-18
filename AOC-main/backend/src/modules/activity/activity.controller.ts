import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { EntityType } from '@prisma/client';

@ApiTags('activity')
@Controller('activity')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get global activity feed' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getGlobalFeed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getGlobalFeed(
      Number(page) || 1, 
      Number(limit) || 20
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get activity feed for a specific user' })
  async getUserFeed(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getUserFeed(
      userId, 
      Number(page) || 1, 
      Number(limit) || 20
    );
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get activity feed for a specific entity (team, project, hackathon)' })
  async getEntityFeed(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getEntityFeed(
      entityType, 
      entityId, 
      Number(page) || 1, 
      Number(limit) || 20
    );
  }
}
