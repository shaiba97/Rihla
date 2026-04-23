import { Module } from '@nestjs/common';
import { AdminPaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';
import { PrismaModule } from '@app/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [AdminPaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}