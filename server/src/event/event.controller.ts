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

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ summary: 'Create a new event' })
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    this.logger.log('Create event request', { data: createEventDto });
    return this.eventService.create(createEventDto);
  }

  @ApiOperation({ summary: 'Get a specific event by ID' })
  @Get(':id')
  findOne(@Param('id') id: number) {
    this.logger.log('Find event request', { eventId: id });
    return this.eventService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a specific event by ID' })
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateEventDto: UpdateEventDto) {
    this.logger.log('Update event request', {
      eventId: id,
      updates: updateEventDto,
    });
    return this.eventService.update(id, updateEventDto);
  }

  @ApiOperation({ summary: 'Delete a specific event by ID' })
  @Delete(':id')
  remove(@Param('id') id: number) {
    this.logger.log('Delete event request', { eventId: id });
    return this.eventService.remove(id);
  }
}
