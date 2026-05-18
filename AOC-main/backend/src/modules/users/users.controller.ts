import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService, BuilderSearchParams } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter builders' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'skills', required: false, isArray: true })
  @ApiQuery({ name: 'availability', required: false })
  @ApiQuery({ name: 'lookingForTeam', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchBuilders(@Query() params: BuilderSearchParams) {
    return this.usersService.searchBuilders(params);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get all available skills for filtering' })
  @ApiQuery({ name: 'category', required: false })
  async getSkills(@Query('category') category?: any) {
    return this.usersService.getAllSkills(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a builder profile by ID' })
  async getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your own profile' })
  async updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.usersService.updateProfile(userId, data);
  }

  @Patch('me/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your skills' })
  async updateMySkills(
    @CurrentUser('sub') userId: string,
    @Body() body: { skills: Array<{ skillId: string; proficiency: string; yearsExperience?: number }> },
  ) {
    return this.usersService.updateSkills(userId, body.skills);
  }
}
