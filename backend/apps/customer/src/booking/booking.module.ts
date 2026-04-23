import { Module } from '@nestjs/common';
import { BookingController } from './controller/booking.controller';
import { BookingService } from './service/booking.service';
import { SessionService } from './service/session.service';
import { PaymentService } from './service/payment.service';
import { PDFService } from './service/pdf.service';
import { PrismaModule } from '@app/prisma';
import { RedisModule } from '@app/redis';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [BookingController],
  providers: [BookingService, SessionService, PaymentService, PDFService],
  exports: [BookingService],
})
export class BookingModule {}