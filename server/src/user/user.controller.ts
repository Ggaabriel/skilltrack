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

// const responseContainer = <T extends Record<string, unknown>>(
//   data: Omit<User, 'password'> | Omit<User, 'password'>[] | null,
//   options?: T,
// ) => ({ data, ...options });

// В контроллере больше не нужно писать responseContainer(...)
//  — можно просто возвращать user, { users, meta },
// { data: null, message: 'User not found' } и т.п.

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
    return user;
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
    return { users, meta };
  }

  @ApiOperation({ summary: 'Get events for a specific user' })
  @Get(':id/events')
  findEvents(@Param('id') id: string, @Query() query: GetUserEventsDto) {
    this.logger.log('Get user events request', { userId: id, query });
    return this.eventService.getUserEvents(+id, query.startDate, query.endDate);
  }

  @ApiOperation({ summary: 'Get a specific user by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log('Find user request', { id });
    const user = await this.userService.findOne(+id);

    if (!user) {
      this.logger.warn('User not found', { userId: id });
      return { data: null, message: 'User not found' };
    }

    this.logger.log('User found', { userId: id });
    return user;
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
    return user;
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
