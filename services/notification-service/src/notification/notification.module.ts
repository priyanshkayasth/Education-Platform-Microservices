import { Module } from '@nestjs/common';
import { NotificationConsumer } from './notification.consumer';
import { EmailService } from './email.service';

@Module({
   controllers: [NotificationConsumer], 
  providers: [EmailService],
})
export class NotificationModule {}
