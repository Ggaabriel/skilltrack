import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
const select = { id: true, email: true, name: true, picturePath: true };

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async create(createUserDto: CreateUserDto) {
    this.logger.log('Creating user', { email: createUserDto.email });
    const data = {
      ...createUserDto,
      password: await this.hashPassword(createUserDto.password),
    };
    const user = await this.prisma.user.create({
      select,
      data,
    });

    this.logger.log('User created in database', { userId: user.id });
    return user;
  }

  async findAll(page: number = 1, limit: number = 10) {
    this.logger.log('Fetching users', { page, limit });
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    this.logger.log('Users fetched', { total, page, limit });
    return { users, total, page, limit };
  }

  async findOne(id: number) {
    this.logger.log('Fetching user by id', { userId: id });
    const user = await this.prisma.user.findUnique({
      where: { id },
      select,
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findByEmail(email: string) {
    this.logger.log('Finding user by email', { email });
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn('User not found by email', { email });
      throw new NotFoundException('User not found');
    }

    this.logger.log('User found by email', { userId: user.id });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    this.logger.log('Updating user', { userId: id, updates: updateUserDto });
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select,
    });

    this.logger.log('User updated in database', { userId: id });
    return user;
  }

  async remove(id: number) {
    this.logger.log('Removing user', { userId: id });
    const user = await this.prisma.user.delete({ where: { id }, select });
    this.logger.log('User removed from database', { userId: id });

    return user;
  }
}
