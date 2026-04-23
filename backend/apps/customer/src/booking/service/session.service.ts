import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RedisService, BOOKING_SESSION_TTL } from '@app/redis';
import { PrismaService } from '@app/prisma';
import { BookingSession } from '../types/booking-session.type';

@Injectable()
export class SessionService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  private static key(sessionId: string): string {
    return `booking_session:${sessionId}`;
  }

  async startSession(data: {
    customerId: string;
    tripId: string;
    seatNumber: number;
  }): Promise<BookingSession> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
      include: { bus: true },
    });

    if (!trip) {
      throw new NotFoundException('الرحلة غير موجودة');
    }

    const price = Number(trip.price) || 500;

    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        tripId: data.tripId,
        seatNumber: data.seatNumber,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('المقعد محجوز مسبقاً');
    }

    if (data.seatNumber < 1 || data.seatNumber > trip.bus.chairs) {
      throw new BadRequestException('رقم المقعد غير صحيح');
    }

    const sessionId = uuidv4();
    const session: BookingSession = {
      sessionId,
      customerId: data.customerId,
      tripId: data.tripId,
      seatNumber: data.seatNumber,
      price,
      companyId: trip.bus.id,
      bankName: 'بنك الخرطان',
      bankAccountNumber: '1234567890',
      paymentInstructions: 'يرجى تحويل المبلغ إلى الحساب المذكور',
      step: 1,
      createdAt: new Date().toISOString(),
    };

    await this.redis.setex(
      SessionService.key(sessionId),
      BOOKING_SESSION_TTL,
      JSON.stringify(session),
    );

    return session;
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
  ): Promise<BookingSession> {
    const session = await this.getSession(sessionId, customerId);

    const updated: BookingSession = {
      ...session,
      ...data,
      step: 2,
    };

    await this.redis.setex(
      SessionService.key(sessionId),
      BOOKING_SESSION_TTL,
      JSON.stringify(updated),
    );

    return updated;
  }

  async getSession(
    sessionId: string,
    customerId: string,
  ): Promise<BookingSession> {
    const raw = await this.redis.get(SessionService.key(sessionId));

    if (!raw) {
      throw new ForbiddenException('انتهت صلاحية الجلسة');
    }

    const session = JSON.parse(raw) as BookingSession;

    if (session.customerId !== customerId) {
      throw new ForbiddenException('غير مصرح');
    }

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(SessionService.key(sessionId));
  }
}
