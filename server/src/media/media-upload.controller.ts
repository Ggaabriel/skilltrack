import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { PrismaService } from 'src/prisma/prisma.service';

const uploadDir = join(process.cwd(), 'uploads');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller('media')
export class MediaUploadController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
          const safeName = randomUUID();
          const extension = extname(file.originalname) || '.bin';
          cb(null, `${safeName}${extension}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(image|video|audio|application)/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: any,
    @CurrentUser() user: JwtPayload,
  ) {
    const rawCourseId = req.body?.courseId ?? req.query?.courseId;
    const courseId = Number(rawCourseId);

    if (!Number.isFinite(courseId) || courseId <= 0) {
      throw new BadRequestException('courseId is required');
    }

    const course = await this.prisma.course.findFirst({
      where: { id: courseId, userId: user.userId },
      select: { id: true },
    });

    if (!course) {
      throw new BadRequestException('Course not found or not owned by user');
    }

    const relativeUrl = `/uploads/${file.filename}`;

    const media = await this.prisma.media.create({
      data: {
        courseId,
        name: file.originalname,
        url: relativeUrl,
        mimeType: file.mimetype,
      },
    });

    return {
      ok: true,
      status: 201,
      message: 'Media uploaded',
      data: media,
    };
  }
}
