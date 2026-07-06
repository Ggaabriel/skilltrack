import { registerAs } from '@nestjs/config';

export type JwtConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
};

export default registerAs<JwtConfig>('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET!,
  accessExpiresIn: +process.env.JWT_ACCESS_EXPIRES_IN!,
  refreshExpiresIn: +process.env.JWT_REFRESH_EXPIRES_IN!,
}));
