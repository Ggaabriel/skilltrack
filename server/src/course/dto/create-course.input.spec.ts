import { CustomValidationPipe } from '../../common/pipes/custom-validation/custom-validation.pipe';
import { CreateCourseInput } from './create-course.input';
import { CourseType } from '../types/course.type';

describe('CreateCourseInput', () => {
  it('preserves GraphQL fields through the whitelist validation pipe', async () => {
    const input = {
      title: 'GraphQL с нуля',
      description: 'Практический курс по GraphQL',
      type: CourseType.STEP_BY_STEP,
    };

    const transformed = (await new CustomValidationPipe().transform(input, {
      type: 'custom',
      metatype: CreateCourseInput,
    })) as CreateCourseInput;

    expect(transformed).toMatchObject(input);
  });
});
