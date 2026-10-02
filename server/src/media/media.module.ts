import { Module } from '@nestjs/common';
import { MediaResolver } from './media.resolver';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaUploadController } from './media-upload.controller';

@Module({
  controllers: [MediaController, MediaUploadController],
  providers: [MediaResolver, MediaService],
})
export class MediaModule {}
