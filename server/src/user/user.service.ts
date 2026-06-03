import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

const select = { id: true, email: true, name: true, picturePath: true };

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({ select, data: createUserDto });
    return {
      data: user,
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);
    return {
      data: users,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select,
    });
    if (!user) {
      return {
        data: null,
      };
    }
    return {
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select,
    });
    return {
      data: user,
    };
  }

  async remove(id: number) {
    const user = await this.prisma.user.delete({ where: { id }, select });
    return {
      data: user,
    };
  }
}
