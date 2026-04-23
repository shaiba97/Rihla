import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { UsersModule } from './users/users.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [UsersModule, BookingModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
