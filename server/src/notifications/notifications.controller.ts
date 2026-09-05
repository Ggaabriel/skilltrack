import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PushSubscriptionDto } from './dto/push-subscription.dto';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { ApiBearerAuth } from '@nestjs/swagger';

const responseContainer = <T extends Record<string, unknown>>(
  data: unknown,
  options?: T,
) => ({ data, ...options });

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscriptions')
  async subscribe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PushSubscriptionDto,
  ) {
    await this.notificationsService.subscribe(user.userId, dto);
    return responseContainer(null, { message: 'Subscribed successfully' });
  }

  @Delete('subscriptions')
  async unsubscribe(
    @CurrentUser() user: JwtPayload,
    @Query('endpoint') endpoint: string,
  ) {
    await this.notificationsService.unsubscribe(user.userId, endpoint);
    return responseContainer(null, { message: 'Unsubscribed successfully' });
  }

  @Post('test')
  async test(@CurrentUser() user: JwtPayload) {
    console.log('Notifications controller: user jwt: ', user);

    await this.notificationsService.sendTestNotification(user.userId);
    return responseContainer(null, { message: 'Test notification sent' });
  }

  // @Post()
  // create(@Body() createNotificationDto: CreateNotificationDto) {
  //   return this.notificationsService.create(createNotificationDto);
  // }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateNotificationDto: UpdateNotificationDto,
  // ) {
  //   return this.notificationsService.update(+id, updateNotificationDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
