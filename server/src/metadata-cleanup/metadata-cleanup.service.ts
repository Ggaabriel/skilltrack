import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class MetadataCleanupService {
  cleanupUnusedTags(tx: Prisma.TransactionClient, tagIds: number[]) {
    return tx.tag.deleteMany({
      where: {
        id: { in: tagIds },
        nodes: { none: {} },
      },
    });
  }

  cleanupUnusedSkills(tx: Prisma.TransactionClient, skillIds: number[]) {
    return tx.skill.deleteMany({
      where: {
        id: { in: skillIds },
        nodes: { none: {} },
      },
    });
  }
}
