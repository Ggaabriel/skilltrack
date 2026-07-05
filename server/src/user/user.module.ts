import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EventModule } from 'src/event/event.module';
import { JwtStrategy } from 'src/auth/strategies/jwt-strategy';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  imports: [EventModule],
  exports: [UserService],
})
export class UserModule {}
