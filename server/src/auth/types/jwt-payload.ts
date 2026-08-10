import { User } from 'src/user/entities/user.entity';

export type JwtPayload = {
  userId: User['id'];
  email: User['email'];
};
