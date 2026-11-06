import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('public-users')
export class PublicUserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  findProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.findPublicProfile(userId);
  }
}
