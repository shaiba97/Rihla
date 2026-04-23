import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';

@Controller('admin/payments')
export class AdminPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('pending')
  async getPending() {
    const payments = await this.paymentService.getPendingPayments();
    return { data: payments };
  }

  @Post('confirm/:paymentId')
  async confirm(
    @Req() req,
    @Param('paymentId') paymentId: string,
    @Body() body: { transferReference?: string; adminNotes?: string },
  ) {
    const result = await this.paymentService.confirmPayment(paymentId, req.user?.id || 'admin', body);
    return { message: 'تم تأكيد الدفع بنجاح', data: result };
  }
}