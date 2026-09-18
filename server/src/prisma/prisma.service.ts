import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { PrismaClient } from '../generated/prisma/client';

import { prismaClientOptions } from '../lib/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super(prismaClientOptions);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
