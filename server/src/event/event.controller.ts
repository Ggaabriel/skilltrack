import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
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
@Controller('event')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ summary: 'Create a new event' })
  @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    this.logger.log('Create event request', { data: createEventDto });

    const event = {
      userId,
      ...createEventDto,
    };

    const newEvent = await this.eventService.create(event);

    return responseContainer(newEvent);
  }

  @ApiOperation({ summary: 'Get a specific event by ID' })
  @Get(':id')
  findOne(@Param('id') id: number) {
    this.logger.log('Find event request', { eventId: id });
    return this.eventService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a specific event by ID' })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    this.logger.log('Update event request', {
      eventId: id,
      updates: updateEventDto,
    });
    const updatedEvent = await this.eventService.update(id, updateEventDto);
    return responseContainer(updatedEvent);
  }

  @ApiOperation({ summary: 'Delete a specific event by ID' })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    this.logger.log('Delete event request', { eventId: id });
    await this.eventService.remove(id);
    return responseContainer(null, { message: 'Event deleted' });
  }
}
