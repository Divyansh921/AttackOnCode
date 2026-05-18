import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService, CreateProjectData } from './projects.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects with filters' })
  async list(
    @Query('status') status?: any,
    @Query('needsContributors') needsContributors?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.projectsService.listProjects({ status, needsContributors, search, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project workspace details' })
  async getProject(@Param('id') id: string) {
    return this.projectsService.getProject(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a project' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() data: CreateProjectData,
  ) {
    return this.projectsService.createProject(userId, data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project details (owner only)' })
  async update(
    @Param('id') projectId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.projectsService.updateProject(projectId, userId, data);
  }

  @Post(':id/needs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a contributor need to the project' })
  async addNeed(
    @Param('id') projectId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: { roleTitle: string; description?: string; skills?: string[] },
  ) {
    return this.projectsService.addNeed(projectId, userId, data);
  }
}
