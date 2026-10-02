import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import { MediaService } from './media.service';
import {
  DeleteMediaResponse,
  MediaResponse,
  MediasResponse,
} from './schemas/media-response.schema';
import { Media } from './schemas/media.schema';

@Resolver(() => Media)
@UseGuards(JwtAuthGuard)
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Query(() => MediasResponse)
  async media(
    @Args('courseId', { type: () => Int }, ParseIntPipe) courseId: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.mediaService.findAll(courseId, userId));
  }

  @Query(() => MediaResponse)
  async mediaItem(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.mediaService.findOne(id, userId));
  }

  @Mutation(() => MediaResponse)
  async createMedia(
    @Args('input', { type: () => CreateMediaInput }) input: CreateMediaInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.mediaService.create(userId, input));
  }

  @Mutation(() => MediaResponse)
  async updateMedia(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateMediaInput }) input: UpdateMediaInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.mediaService.update(id, userId, input));
  }

  @Mutation(() => DeleteMediaResponse)
  async deleteMedia(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.mediaService.remove(id, userId));
  }
}
