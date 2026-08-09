import { User } from 'src/user/entities/user.entity';

export type JwtPayload = {
  id: User['id'];
  email: User['email'];
};
