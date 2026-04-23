import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { PDFService } from './pdf.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PDFService,
  ) {}

  async createPendingPayment(data: {
    bookingId: string;
    customerId: string;
    price: number;
  }) {
    const totalAmount = data.price;
    const commissionAmount = Number((totalAmount * 0.1).toFixed(2));
    const companyAmount = Number((totalAmount * 0.9).toFixed(2));

    return this.prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        customerId: data.customerId,
        totalAmount,
        companyAmount,
        commissionAmount,
        currency: 'SDG',
        status: 'PENDING',
      },
    });
  }

  async confirmPayment(
    paymentId: string,
    adminId: string,
    data: {
      transferReference?: string;
      adminNotes?: string;
    },
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException('الدفعة غير موجودة');
    }

    if (payment.status === 'SUCCESS') {
      throw new BadRequestException('تم تأكيد هذه الدفعة مسبقاً');
    }

    const booking = await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        transferReference: data.transferReference || null,
        adminNotes: data.adminNotes || null,
        confirmedBy: adminId,
        paidAt: new Date(),
      },
    });

    try {
      const ticketUrl = await this.pdfService.generateTicket(booking.id);
      await this.prisma.ticketPDF.create({
        data: {
          bookingId: booking.id,
          ticketUrl,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
    }

    return { booking, payment };
  }

  async getPendingPayments() {
    return this.prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: { booking: { include: { trip: true } }, customer: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPaymentByBooking(bookingId: string) {
    return this.prisma.payment.findUnique({
      where: { bookingId },
    });
  }
}
