import { registerEnumType } from '@nestjs/graphql';

export enum CourseType {
  QUICK_NOTE = 'QUICK_NOTE',
  STEP_BY_STEP = 'STEP_BY_STEP',
  FREE_FORM = 'FREE_FORM',
}

registerEnumType(CourseType, {
  name: 'CourseType',
});
