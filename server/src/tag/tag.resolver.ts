import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { TagService } from './tag.service';
import {
  DeleteTagResponse,
  TagResponse,
  TagsResponse,
} from './schemas/tag-response.schema';
import { Tag } from './schemas/tag.schema';

@Resolver(() => Tag)
@UseGuards(JwtAuthGuard)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}

  @Query(() => TagsResponse)
  async tags(
    @Args('courseId', { type: () => Int }, ParseIntPipe) courseId: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.tagService.findAll(courseId, userId));
  }

  @Query(() => TagResponse)
  async tag(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.tagService.findOne(id, userId));
  }

  @Mutation(() => TagResponse)
  async createTag(
    @Args('input', { type: () => CreateTagInput }) input: CreateTagInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.tagService.create(userId, input));
  }

  @Mutation(() => TagResponse)
  async updateTag(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateTagInput }) input: UpdateTagInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.tagService.update(id, userId, input));
  }

  @Mutation(() => DeleteTagResponse)
  async deleteTag(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.tagService.remove(id, userId));
  }
}
