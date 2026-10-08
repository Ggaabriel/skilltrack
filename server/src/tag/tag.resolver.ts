import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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
  async tags() {
    return graphqlSuccess(await this.tagService.findAll());
  }

  @Query(() => TagResponse)
  async tag(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return graphqlSuccess(await this.tagService.findOne(id));
  }

  @Mutation(() => TagResponse)
  async createTag(
    @Args('input', { type: () => CreateTagInput }) input: CreateTagInput,
  ) {
    return graphqlSuccess(await this.tagService.create(input));
  }

  @Mutation(() => TagResponse)
  async updateTag(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateTagInput }) input: UpdateTagInput,
  ) {
    return graphqlSuccess(await this.tagService.update(id, input));
  }

  @Mutation(() => DeleteTagResponse)
  async deleteTag(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return graphqlSuccess(await this.tagService.remove(id));
  }
}
