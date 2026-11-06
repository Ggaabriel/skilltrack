import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseResolver } from './course.resolver';
import { NodeModule } from '../node/node.module';

@Module({
  imports: [NodeModule],
  providers: [CourseResolver, CourseService],
})
export class CourseModule {}
