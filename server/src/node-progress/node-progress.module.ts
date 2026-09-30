import { Module } from '@nestjs/common';
import { NodeProgressResolver } from './node-progress.resolver';
import { NodeProgressService } from './node-progress.service';

@Module({
  providers: [NodeProgressResolver, NodeProgressService],
})
export class NodeProgressModule {}
