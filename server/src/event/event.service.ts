import { Injectable, Logger } from '@nestjs/common';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Event } from './entities/event.entity';
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
  async create(event: Omit<Event, 'id'>) {
    this.logger.log('Creating event', { data: event });
    const createdEvent = await this.prisma.event.create({
      data: event,
      select,
    });

    this.logger.log('Event created', { eventId: createdEvent.id });
    return createdEvent;
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
      return null;
    }

    this.logger.log('User events fetched', { userId, count: events.length });
    return events;
  }

  async findOne(id: number) {
    this.logger.log('Finding event by id', { eventId: id });
    const event = await this.prisma.event.findUnique({
      where: { id },
      select,
    });
    if (!event) {
      this.logger.warn('Event not found', { eventId: id });
      return null;
    }
    this.logger.log('Event found', { eventId: id });
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    this.logger.log('Updating event', { eventId: id, updates: updateEventDto });
    const event = await this.prisma.event.update({
      where: { id },
      data: updateEventDto,
      select,
    });
    this.logger.log('Event updated', { eventId: id });
    return event;
  }

  async remove(id: number) {
    this.logger.log('Removing event', { eventId: id });
    await this.prisma.event.delete({
      where: { id },
      select,
    });
    this.logger.log('Event removed', { eventId: id });
  }
}
