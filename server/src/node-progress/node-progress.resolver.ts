import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload';
import {
  NodeProgressListResponse,
  NodeProgressResetResponse,
  NodeProgressResponse,
  CourseProgressListResponse,
} from './schemas/node-progress-response.schema';
import { NodeProgressService } from './node-progress.service';
import { SetNodeProgressInput } from './dto/set-node-progress.input';

@Resolver()
@UseGuards(JwtAuthGuard)
export class NodeProgressResolver {
  constructor(private readonly nodeProgressService: NodeProgressService) {}

  @Query(() => NodeProgressListResponse)
  async nodeProgress(
    @Args('courseId', { type: () => Int }, ParseIntPipe) courseId: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(
      await this.nodeProgressService.findForCourse(courseId, userId),
    );
  }

  @Query(() => CourseProgressListResponse)
  async myCourseProgress(@CurrentUser() { userId }: JwtPayload) {
    return graphqlSuccess(
      await this.nodeProgressService.findCourseProgressSummaries(userId),
    );
  }

  @Mutation(() => NodeProgressResponse)
  async setNodeProgress(
    @Args('input', { type: () => SetNodeProgressInput })
    input: SetNodeProgressInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(
      await this.nodeProgressService.setForNode(userId, input),
    );
  }

  @Mutation(() => NodeProgressResetResponse)
  async resetNodeProgress(
    @Args('nodeId', { type: () => Int }, ParseIntPipe) nodeId: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(
      await this.nodeProgressService.resetForNode(userId, nodeId),
    );
  }

  @Mutation(() => NodeProgressResetResponse)
  async resetCourseProgress(
    @Args('courseId', { type: () => Int }, ParseIntPipe) courseId: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(
      await this.nodeProgressService.resetForCourse(userId, courseId),
    );
  }

  @Mutation(() => NodeProgressResetResponse)
  async removeCourseProgress(
    @Args('courseId', { type: () => Int }, ParseIntPipe) courseId: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(
      await this.nodeProgressService.removeForCourse(userId, courseId),
    );
  }
}
