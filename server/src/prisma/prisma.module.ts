import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MetadataCleanupService } from '../metadata-cleanup/metadata-cleanup.service';

@Global()
@Module({
  providers: [PrismaService, MetadataCleanupService],
  exports: [PrismaService, MetadataCleanupService],
})
export class PrismaModule {}
