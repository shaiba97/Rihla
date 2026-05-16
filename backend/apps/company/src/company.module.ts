import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { BusesModule } from './buses/buses.module';
import { TripsModule } from './trips/trips.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [BusesModule, TripsModule, UsersModule, AuthModule, PaymentModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
