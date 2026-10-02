import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('media')
export class MediaController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    const media = await this.prisma.media.findFirst({
      where: { id, course: { is: { userId } } },
    });

    return { ok: true, status: 200, message: 'success', data: media };
  }
}
