import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { UsersModule } from './users/users.module';
import { BookingModule } from './booking/booking.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RihlaWsModule } from '@app/websocket';

@Module({
  imports: [UsersModule, BookingModule, NotificationsModule, RihlaWsModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
