import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EventModule } from 'src/event/event.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [EventModule],
})
export class UserModule {}
