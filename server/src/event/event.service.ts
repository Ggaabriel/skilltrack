import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
const select = {
  id: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  color: true,
};
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly prisma: PrismaService) {}
  async create(createEventDto: CreateEventDto) {
    this.logger.log('Creating event', { data: createEventDto });
    const event = await this.prisma.event.create({
      data: createEventDto,
      select,
    });
    const response = {
      data: event,
    };
    this.logger.log('Event created', { eventId: event.id });
    return response;
  }
  async getUserEvents(userId: number, startDate: string, endDate: string) {
    this.logger.log('Fetching user events', { userId, startDate, endDate });
    const events = await this.prisma.event.findMany({
      where: {
        userId,
        AND: [
          { startDate: { lte: new Date(endDate) } },
          { endDate: { gte: new Date(startDate) } },
        ],
      },
      select,
      orderBy: { startDate: 'asc' },
    });

    if (events.length === 0) {
      this.logger.log('No events found for user', {
        userId,
        startDate,
        endDate,
      });
      return {
        data: null,
      };
    }

    this.logger.log('User events fetched', { userId, count: events.length });
    return {
      data: events,
    };
  }

  async findOne(id: number) {
    this.logger.log('Finding event by id', { eventId: id });
    const event = await this.prisma.event.findUnique({
      where: { id },
      select,
    });
    if (!event) {
      this.logger.warn('Event not found', { eventId: id });
      return {
        data: null,
      };
    }
    this.logger.log('Event found', { eventId: id });
    return {
      data: event,
    };
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    this.logger.log('Updating event', { eventId: id, updates: updateEventDto });
    const event = await this.prisma.event.update({
      where: { id },
      data: updateEventDto,
      select,
    });
    this.logger.log('Event updated', { eventId: id });
    return {
      data: event,
    };
  }

  async remove(id: number) {
    this.logger.log('Removing event', { eventId: id });
    const event = await this.prisma.event.delete({
      where: { id },
      select,
    });
    this.logger.log('Event removed', { eventId: id });
    return {
      data: event,
    };
  }
}
