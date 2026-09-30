import { ParseIntPipe, UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { graphqlSuccess } from '../common/graphql/graphql-response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { CreateNodeInput } from './dto/create-node.input';
import { MoveNodeInput } from './dto/move-node.input';
import { ReorderNodeInput } from './dto/reorder-node.input';
import { UpdateNodeInput } from './dto/update-node.input';
import { NodeService } from './node.service';
import {
  DeleteNodeResponse,
  NodeResponse,
  NodesResponse,
} from './schemas/node-response.schema';
import { CourseNode } from './schemas/node.schema';

@Resolver(() => CourseNode)
@UseGuards(JwtAuthGuard)
export class NodeResolver {
  constructor(private readonly nodeService: NodeService) {}

  @ResolveField(() => [CourseNode])
  children(@Parent() node: CourseNode): CourseNode[] {
    return node.children ?? [];
  }

  @Query(() => NodesResponse)
  async nodes(
    @Args('courseId', { type: () => Int }, ParseIntPipe) courseId: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.nodeService.findAll(courseId, userId));
  }

  @Query(() => NodeResponse)
  async node(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.nodeService.findOne(id, userId));
  }

  @Mutation(() => NodeResponse)
  async createNode(
    @Args('input', { type: () => CreateNodeInput }) input: CreateNodeInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.nodeService.create(userId, input));
  }

  @Mutation(() => NodeResponse)
  async updateNode(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => UpdateNodeInput }) input: UpdateNodeInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.nodeService.update(id, userId, input));
  }

  @Mutation(() => NodeResponse)
  async moveNode(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => MoveNodeInput }) input: MoveNodeInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.nodeService.move(id, userId, input));
  }

  @Mutation(() => NodeResponse)
  async reorderNode(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @Args('input', { type: () => ReorderNodeInput }) input: ReorderNodeInput,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.nodeService.reorder(id, userId, input));
  }

  @Mutation(() => DeleteNodeResponse)
  async deleteNode(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
    @CurrentUser() { userId }: JwtPayload,
  ) {
    return graphqlSuccess(await this.nodeService.remove(id, userId));
  }
}
