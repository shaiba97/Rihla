import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { PaymentService } from './payment.service';
import { PrismaService } from '@app/prisma';

@Injectable()
export class BookingService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  async startSession(data: {
    customerId: string;
    tripId: string;
    seatNumber: number;
  }) {
    return this.sessionService.startSession(data);
  }

  async addPassenger(
    sessionId: string,
    customerId: string,
    data: {
      passengerName: string;
      passengerAge: number;
      passengerGender: 'MALE' | 'FEMALE';
      passengerContact: string;
    },
  ) {
    return this.sessionService.addPassenger(sessionId, customerId, data);
  }

  async getSessionSummary(sessionId: string, customerId: string) {
    const session = await this.sessionService.getSession(sessionId, customerId);

    const bankName = process.env.PAYMENT_BANK_NAME || 'بنك الخرطين';
    const accountNumber = process.env.PAYMENT_ACCOUNT_NUMBER || '1234567890';
    const instructions = process.env.PAYMENT_INSTRUCTIONS || 'يرجى تحويل المبلغ';

    return {
      ...session,
      paymentInstructions: {
        bankName: session.bankName || bankName,
        accountNumber: session.bankAccountNumber || accountNumber,
        instructions: session.paymentInstructions || instructions,
        amount: session.price,
        currency: 'SDG',
      },
    };
  }

  async confirmBooking(sessionId: string, customerId: string) {
    const session = await this.sessionService.getSession(sessionId, customerId);

    if (!session.passengerName) {
      throw new BadRequestException('يرجى إدخال بيانات المسافر أولاً');
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: session.tripId },
    });

    const price = trip?.price ? Number(trip.price) : session.price;

    const booking = await this.prisma.booking.create({
      data: {
        customerId: session.customerId,
        tripId: session.tripId,
        seatNumber: session.seatNumber,
        passengerName: session.passengerName,
        passengerAge: session.passengerAge!,
        passengerGender: session.passengerGender!,
        passengerContact: session.passengerContact!,
        status: 'PENDING',
      },
    });

    const payment = await this.paymentService.createPendingPayment({
      bookingId: booking.id,
      customerId: session.customerId,
      price,
    });

    await this.sessionService.deleteSession(sessionId);

    const bankName = process.env.PAYMENT_BANK_NAME || 'بنك الخرطين';
    const accountNumber = process.env.PAYMENT_ACCOUNT_NUMBER || '1234567890';
    const instructions =
      process.env.PAYMENT_INSTRUCTIONS || 'يرجى تحويل المبلغ';

    return {
      booking,
      payment,
      paymentInstructions: {
        bankName: session.bankName || bankName,
        accountNumber: session.bankAccountNumber || accountNumber,
        instructions: session.paymentInstructions || instructions,
        amount: price,
        currency: 'SDG',
        bookingId: booking.id,
        paymentId: payment.id,
      },
    };
  }

  async getMyBookings(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: {
        trip: { include: { bus: true } },
        payment: true,
        ticketPDF: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingById(id: string, customerId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, customerId },
      include: {
        trip: { include: { bus: true } },
        payment: true,
        ticketPDF: true,
        customer: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    return booking;
  }
}
