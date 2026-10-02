import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';
import { SkillService } from './skill.service';
import {
  DeleteSkillResponse,
  SkillResponse,
  SkillsResponse,
} from './schemas/skill-response.schema';
import { Skill } from './schemas/skill.schema';

@Resolver(() => Skill)
@UseGuards(JwtAuthGuard)
export class SkillResolver {
  constructor(private readonly skillService: SkillService) {}

  @Query(() => SkillsResponse)
  async skills(
    @Args('courseId', { type: () => Int }, ParseIntPipe) courseId: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.skillService.findAll(courseId, userId));
  }

  @Query(() => SkillResponse)
  async skill(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.skillService.findOne(id, userId));
  }

  @Mutation(() => SkillResponse)
  async createSkill(
    @Args('input', { type: () => CreateSkillInput }) input: CreateSkillInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.skillService.create(userId, input));
  }

  @Mutation(() => SkillResponse)
  async updateSkill(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateSkillInput }) input: UpdateSkillInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.skillService.update(id, userId, input));
  }

  @Mutation(() => DeleteSkillResponse)
  async deleteSkill(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.skillService.remove(id, userId));
  }
}
