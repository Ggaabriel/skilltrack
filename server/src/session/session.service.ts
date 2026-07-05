import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly hashRefreshToken = async (
    refreshToken: string,
  ): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(refreshToken, saltRounds);
  };

  async create({
    userId,
    refreshToken,
    expires,
    userAgent,
    id,
  }: {
    userId: number;
    refreshToken: string;
    expires: Date;
    userAgent?: string;
    id?: string;
  }) {
    const hashedRefreshToken = await this.hashRefreshToken(refreshToken);
    const sessionId = id || crypto.randomUUID(); // Generate a new UUID if id is not provided
    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId,
        refreshToken: hashedRefreshToken,
        expires,
        userAgent,
      },
    });
  }

  async findOne(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async findByToken(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        refreshToken,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async findByUserId(userId: number) {
    return await this.prisma.session.findMany({
      where: {
        userId,
      },
    });
  }

  async delete(sessionId: string) {
    await this.prisma.session.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async deleteAllUserSessions(userId: number) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  async rotate(sessionId: string, newRefreshToken: string, newExpires: Date) {
    const newHashedRefreshToken = await this.hashRefreshToken(newRefreshToken);
    await this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        refreshToken: newHashedRefreshToken,
        expires: newExpires,
      },
    });
  }
}
