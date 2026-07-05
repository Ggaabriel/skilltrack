import { Injectable } from '@nestjs/common';
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
  constructor(private readonly prisma: PrismaService) {}
  async create(createEventDto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: createEventDto,
      select,
    });
    return {
      data: event,
    };
  }
  async getUserEvents(userId: number, startDate: string, endDate: string) {
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
      return {
        data: null,
      };
    }

    return {
      data: events,
    };
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select,
    });
    if (!event) {
      return {
        data: null,
      };
    }
    return {
      data: event,
    };
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.update({
      where: { id },
      data: updateEventDto,
      select,
    });
    return {
      data: event,
    };
  }

  async remove(id: number) {
    const event = await this.prisma.event.delete({
      where: { id },
      select,
    });
    return {
      data: event,
    };
  }
}
