import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { JwtStrategy } from 'src/auth/strategies/jwt-strategy';

@Module({
  controllers: [EventController],
  providers: [EventService, JwtStrategy],
  exports: [EventService],
})
export class EventModule {}
