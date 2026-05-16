import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from '../service/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('summary')
  @UseGuards(AuthGuard('jwt'))
  async getSummary(@Req() req: any) {
    const data = await this.paymentService.getFinancialSummary(req.user.id);
    return { data };
  }
}
