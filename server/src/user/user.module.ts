import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PublicUserController } from './public-user.controller';
import { EventModule } from 'src/event/event.module';
import { JwtStrategy } from 'src/auth/strategies/jwt-strategy';

@Module({
  controllers: [UserController, PublicUserController],
  providers: [UserService, JwtStrategy],
  imports: [EventModule],
  exports: [UserService],
})
export class UserModule {}
