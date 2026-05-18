import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService, TeamSearchParams, CreateTeamData, CreateOpeningData } from './teams.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter teams' })
  async searchTeams(@Query() params: TeamSearchParams) {
    return this.teamsService.searchTeams(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team details' })
  async getTeam(@Param('id') id: string) {
    return this.teamsService.getTeam(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team' })
  async createTeam(
    @CurrentUser('sub') userId: string,
    @Body() data: CreateTeamData,
  ) {
    return this.teamsService.createTeam(userId, data);
  }

  @Post(':id/openings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a recruitment opening (leader only)' })
  async createOpening(
    @Param('id') teamId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: CreateOpeningData,
  ) {
    return this.teamsService.createOpening(teamId, userId, data);
  }

  @Post('openings/:openingId/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to join a team through an opening' })
  async applyToTeam(
    @Param('openingId') openingId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { message?: string },
  ) {
    return this.teamsService.applyToTeam(openingId, userId, body.message);
  }

  @Patch('applications/:applicationId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a team application (leader only)' })
  async acceptApplication(
    @Param('applicationId') applicationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.teamsService.acceptApplication(applicationId, userId);
  }

  @Patch('applications/:applicationId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a team application (leader only)' })
  async rejectApplication(
    @Param('applicationId') applicationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.teamsService.rejectApplication(applicationId, userId);
  }
}
