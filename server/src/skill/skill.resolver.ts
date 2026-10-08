import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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
  async skills() {
    return graphqlSuccess(await this.skillService.findAll());
  }

  @Query(() => SkillResponse)
  async skill(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return graphqlSuccess(await this.skillService.findOne(id));
  }

  @Mutation(() => SkillResponse)
  async createSkill(
    @Args('input', { type: () => CreateSkillInput }) input: CreateSkillInput,
  ) {
    return graphqlSuccess(await this.skillService.create(input));
  }

  @Mutation(() => SkillResponse)
  async updateSkill(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateSkillInput }) input: UpdateSkillInput,
  ) {
    return graphqlSuccess(await this.skillService.update(id, input));
  }

  @Mutation(() => DeleteSkillResponse)
  async deleteSkill(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return graphqlSuccess(await this.skillService.remove(id));
  }
}
