import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventService } from 'src/event/event.service';
import { GetUserEventsDto } from './dto/get-user-events.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';

const responseContainer = <T extends Record<string, unknown>>(
  data: unknown,
  options?: T,
) => ({ data, ...options });

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly eventService: EventService,
  ) {}

  @ApiOperation({ summary: 'Create a new user' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Create user request', { email: createUserDto.email });
    const user = await this.userService.create(createUserDto);
    this.logger.log('User created', { userId: user.id });
    return responseContainer(user);
  }

  @ApiOperation({ summary: 'Get all users with pagination' })
  @Get()
  async findAll() {
    this.logger.log('Find all users request');
    const { users, total, page, limit } = await this.userService.findAll();
    const meta = {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };

    this.logger.log('Found users', { total, page, limit });
    return responseContainer(users, { meta });
  }

  @ApiOperation({ summary: 'Get events for a specific user' })
  @Get(':id/events')
  async findEvents(@Param('id') id: string, @Query() query: GetUserEventsDto) {
    this.logger.log('Get user events request', { userId: id, query });
    const events = await this.eventService.getUserEvents(
      +id,
      query.startDate,
      query.endDate,
    );
    return responseContainer(events);
  }

  @Get('me')
  async getMe(@CurrentUser() { userId }: JwtPayload) {
    this.logger.log('Find user request', { userId });
    const user = await this.userService.findOne(+userId);

    if (!user) {
      this.logger.warn('User not found', { userId });
      return responseContainer(null, { message: 'User not found' });
    }

    this.logger.log('User found', { userId });
    return responseContainer(user);
  }

  @ApiOperation({ summary: 'Get a specific user by ID' })
  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    this.logger.log('Find user request', { userId });
    const user = await this.userService.findOne(+userId);

    if (!user) {
      this.logger.warn('User not found', { userId });
      return responseContainer(null, { message: 'User not found' });
    }

    this.logger.log('User found', { userId });
    return responseContainer(user);
  }

  @ApiOperation({ summary: 'Update a specific user by ID' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log('Update user request', {
      userId: id,
      updates: updateUserDto,
    });
    const user = await this.userService.update(+id, updateUserDto);
    this.logger.log('User updated', { userId: id });
    return responseContainer(user);
  }

  @ApiOperation({ summary: 'Delete a specific user by ID' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log('Remove user request', { userId: id });
    const user = await this.userService.remove(+id);
    this.logger.log('User removed', { userId: id });
    return user;
  }
}
