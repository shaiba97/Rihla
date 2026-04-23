import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { BookingService } from '../service/booking.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('session/start')
  async startSession(
    @Req() req: AuthenticatedRequest,
    @Body() body: { tripId: string; seatNumber: number; customerId?: string },
  ) {
    const customerId = body.customerId || req.user?.id;
    if (!customerId) {
      return { message: 'يرجى تسجيل الدخول أولاً', statusCode: 401 };
    }
    const session = await this.bookingService.startSession({
      customerId,
      tripId: body.tripId,
      seatNumber: body.seatNumber,
    });
    return {
      message: 'تم حجز الجلسة بنجاح',
      sessionId: session.sessionId,
      data: session,
    };
  }

  @Post('session/passenger')
  async addPassenger(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      sessionId: string;
      passengerName: string;
      passengerAge: number;
      passengerGender: 'MALE' | 'FEMALE';
      passengerContact: string;
      customerId?: string;
    },
  ) {
    const customerId = body.customerId || req.user?.id;
    if (!customerId) {
      return { message: 'يرجى تسجيل الدخول أولاً', statusCode: 401 };
    }
    const session = await this.bookingService.addPassenger(
      body.sessionId,
      customerId,
      {
        passengerName: body.passengerName,
        passengerAge: body.passengerAge,
        passengerGender: body.passengerGender,
        passengerContact: body.passengerContact,
      },
    );
    return {
      message: 'تم حفظ بيانات المسافر',
      data: session,
    };
  }

  @Get('session/:sessionId/summary')
  async getSessionSummary(
    @Param('sessionId') sessionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const customerId = (req.query?.customerId as string) || req.user?.id;
    if (!customerId) {
      return {
        message: 'يرجى تسجيل الدخول أولاً',
        statusCode: 401,
        status: false,
      };
    }
    const summary = await this.bookingService.getSessionSummary(
      sessionId,
      customerId,
    );
    return { data: summary };
  }

  @Post('session/confirm')
  async confirmBooking(
    @Req() req: AuthenticatedRequest,
    @Body() body: { sessionId: string; customerId?: string },
  ) {
    const customerId = body.customerId || req.user?.id;
    if (!customerId) {
      return {
        message: 'يرجى تسجيل الدخول أولاً',
        statusCode: 401,
        status: false,
      };
    }
    const result = await this.bookingService.confirmBooking(
      body.sessionId,
      customerId,
    );
    return { message: 'تم إنشاء الحجز بنجاح', data: result };
  }

  @Get('my-bookings')
  async getMyBookings(@Req() req: AuthenticatedRequest) {
    const customerId = req.user?.id;
    if (!customerId) {
      return {
        message: 'يرجى تسجيل الدخول أولاً',
        success: false,
        statusCode: 401,
      };
    }
    const bookings = await this.bookingService.getMyBookings(customerId);
    return { data: bookings };
  }

  @Get(':id')
  async getBookingById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const customerId = req.user?.id;
    if (!customerId) {
      return { message: 'يرجى تسجيل الدخول أولاً', statusCode: 401 };
    }
    const booking = await this.bookingService.getBookingById(id, customerId);
    return { data: booking };
  }
}
