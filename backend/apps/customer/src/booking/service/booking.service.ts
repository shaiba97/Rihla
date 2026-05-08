import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '@app/prisma';
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  async create(createBookingDto: CreateBookingDto, customerId: string) {
    // Check if trip exists
    const trip = await this.prisma.trip.findUnique({
      where: { id: createBookingDto.tripId },
    });

    if (!trip) {
      throw new NotFoundException('الرحلة غير موجودة');
    }

    // Check if seat is already booked for this trip
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        tripId: createBookingDto.tripId,
        seatNumbers: {
          hasSome: createBookingDto.seatNumbers,
        },
        customerId: customerId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Seat is already booked');
    }

    const booking = await this.prisma.booking.create({
      data: {
        ...createBookingDto,
        customerId: customerId,
        passenger: createBookingDto.passenger as any,
      },
      include: {
        Trip: true,
        Payment: true,
        TicketPDF: true,
      },
    });

    return booking;
  }

  async getBookedSeats(tripId: string): Promise<number[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        tripId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
      select: {
        seatNumbers: true,
      },
    });

    const bookedSeats = bookings.flatMap((booking: any) => booking.seatNumbers);

    // Flatten the array of seat numbers
    return bookedSeats;
  }

  async getBookings() {
    return this.prisma.booking.findMany({
      include: {
        Trip: { include: { Bus: true } },
        Payment: true,
        TicketPDF: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getBookingsByProperties(
    property1: string,
    value1: string,
    property2: string,
    value2: string,
  ) {
    return this.prisma.booking.findMany({
      where: {
        AND: [{ [property1]: value1 }, { [property2]: value2 }],
      },
      include: {
        Trip: { include: { Bus: true } },
        Payment: true,
        TicketPDF: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getBookingsByProperty(property: string, value: string) {
    const whereClause: any = {};
    whereClause[property] = value;

    return this.prisma.booking.findMany({
      where: whereClause,
      include: {
        Trip: { include: { Bus: true } },
        Payment: true,
        TicketPDF: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getBooking(property: string, value: string) {
    const whereClause: any = {};
    whereClause[property] = value;

    const booking = await this.prisma.booking.findFirst({
      where: whereClause,
      include: {
        Trip: { include: { Bus: true } },
        Payment: true,
        TicketPDF: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    return booking;
  }

  async getBookingByProperties(
    property1: string,
    value1: string,
    property2: string,
    value2: string,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        AND: [{ [property1]: value1 }, { [property2]: value2 }],
      },
      include: {
        Trip: { include: { Bus: true } },
        Payment: true,
        TicketPDF: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    // Check if booking exists
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    // If updating seatNumbers, check if new seat is already booked for this trip
    if (updateBookingDto.seatNumbers && updateBookingDto.tripId) {
      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          id: { not: id },
          tripId: updateBookingDto.tripId,
          seatNumbers: {
            hasSome: updateBookingDto.seatNumbers, // ✅ Check for overlapping seats
          },
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException('المقعد محجوز بالفعل');
      }
    }

    const updateData: {
      passenger?: any;
      customerId?: string;
      tripId?: string;
      seatNumbers?: number[];
      passengerContact?: string;
      status?: BookingStatus;
    } = {};

    if (updateBookingDto.passenger !== undefined)
      updateData.passenger = updateBookingDto.passenger;
    if (updateBookingDto.customerId !== undefined)
      updateData.customerId = updateBookingDto.customerId;
    if (updateBookingDto.tripId !== undefined)
      updateData.tripId = updateBookingDto.tripId;
    if (updateBookingDto.seatNumbers !== undefined)
      updateData.seatNumbers = updateBookingDto.seatNumbers;
    if (updateBookingDto.passengerContact !== undefined)
      updateData.passengerContact = updateBookingDto.passengerContact;
    if (updateBookingDto.status !== undefined)
      updateData.status = updateBookingDto.status;

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        Trip: { include: { Bus: true } },
        Payment: true,
        TicketPDF: true,
      },
    });

    return updatedBooking;
  }

  async delete(id: string) {
    // Check if booking exists
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    await this.prisma.booking.delete({
      where: { id },
    });

    return { message: 'تم حذف الحجز بنجاح' };
  }
}
