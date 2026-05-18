import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HackathonsService, CreateHackathonData } from './hackathons.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('hackathons')
@Controller('hackathons')
export class HackathonsController {
  constructor(private hackathonsService: HackathonsService) {}

  @Get()
  @ApiOperation({ summary: 'List hackathons with filter' })
  @ApiQuery({ name: 'filter', enum: ['upcoming', 'ongoing', 'past'], required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async list(
    @Query('filter') filter?: 'upcoming' | 'ongoing' | 'past',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.hackathonsService.listHackathons(filter, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hackathon details with teams and interested builders' })
  async getHackathon(@Param('id') id: string) {
    return this.hackathonsService.getHackathon(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a hackathon listing' })
  async create(@Body() data: CreateHackathonData) {
    return this.hackathonsService.createHackathon(data);
  }

  @Post(':id/interest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Express interest in a hackathon' })
  async expressInterest(
    @Param('id') hackathonId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.hackathonsService.expressInterest(hackathonId, userId);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register team for a hackathon (leader only)' })
  async registerTeam(
    @Param('id') hackathonId: string,
    @Body('teamId') teamId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.hackathonsService.registerTeam(hackathonId, teamId, userId);
  }
}
