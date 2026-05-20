import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaymentService } from './payment.service';
import { PrismaService } from '@app/prisma';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CreateBookingWithPaymentDto,
} from '../dto/booking.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  async create(createBookingDto: CreateBookingDto, customerId: string) {
    try {
      console.log(createBookingDto);
      const trip = await this.prisma.trip.findUnique({
        where: { id: createBookingDto.tripId },
      });

      if (!trip) {
        throw new NotFoundException('الرحلة غير موجودة');
      }

      if (
        !Array.isArray(createBookingDto.seatNumbers) ||
        createBookingDto.seatNumbers.length === 0
      ) {
        throw new BadRequestException('يجب اختيار مقعد واحد على الأقل');
      }

      const sanitizedSeats = createBookingDto.seatNumbers.map(Number);

      const existingBooking = await this.prisma.booking.findFirst({
        where: {
          tripId: createBookingDto.tripId,
          seatNumbers: {
            hasSome: sanitizedSeats,
          },
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
      });

      if (existingBooking) {
        throw new BadRequestException('هذا المقعد محجوز بالفعل');
      }

      const booking = await this.prisma.booking.create({
        data: {
          ...createBookingDto,
          seatNumbers: sanitizedSeats,
          customerId: customerId,
          passenger: createBookingDto.passenger as any,
        },
        include: {
          Trip: true,
          Payment: true,
          TicketPDF: true,
        },
      });

      const tripPrice = Number(trip.price ?? 0);
      const seatCount = sanitizedSeats.length;
      const baseAmount = tripPrice * seatCount;

      const activeFee = await this.prisma.platformFee.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      const platformFeeAmount = activeFee ? Number(activeFee.amount) : 0;
      const totalAmount = baseAmount + platformFeeAmount;

      return {
        ...(booking as any),
        _pricing: {
          tripPrice,
          seatCount,
          baseAmount,
          platformFeeAmount,
          platformFeeLabel: activeFee?.description || 'رسوم المنصة',
          platformFeeRate: activeFee ? Number(activeFee.amount) : 0,
          totalAmount,
          currency: trip.price ? 'جنيه' : 'جنيه',
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(
          'بيانات الحجز غير صالحة. يرجى التحقق من المدخلات',
        );
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'حدث خطأ في قاعدة البيانات. يرجى المحاولة مجدداً',
        );
      }
      throw error;
    }
  }

  async createBookingWithPayment(
    dto: CreateBookingWithPaymentDto,
    customerId: string,
    receiptFile?: string,
  ) {
    try {
      if (typeof dto.seatNumbers === 'string') {
        try {
          dto.seatNumbers = JSON.parse(dto.seatNumbers);
        } catch {
          dto.seatNumbers = [];
        }
      }
      if (typeof dto.passenger === 'string') {
        try {
          dto.passenger = JSON.parse(dto.passenger);
        } catch {
          dto.passenger = [];
        }
        if (!Array.isArray(dto.seatNumbers) || dto.seatNumbers.length === 0) {
          throw new BadRequestException('يجب اختيار مقعد واحد على الأقل');
        }

        const sanitizedSeats = dto.seatNumbers.map(Number);

        const result = await this.prisma.$transaction(async (tx) => {
          const trip = await tx.trip.findUnique({
            where: { id: dto.tripId },
          });

          if (!trip) {
            throw new NotFoundException('الرحلة غير موجودة');
          }

          const existingBooking = await tx.booking.findFirst({
            where: {
              tripId: dto.tripId,
              seatNumbers: { hasSome: sanitizedSeats },
              status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
            },
          });

          if (existingBooking) {
            throw new BadRequestException('هذا المقعد محجوز بالفعل');
          }

          const tripPrice = Number(trip.price ?? 0);
          const seatCount = sanitizedSeats.length;
          const baseAmount = tripPrice * seatCount;

          const booking = await tx.booking.create({
            data: {
              tripId: dto.tripId,
              customerId,
              seatNumbers: sanitizedSeats,
              passenger: dto.passenger as any,
              passengerContact: dto.passengerContact,
              status: BookingStatus.PENDING,
            },
          });

          const activeFee = await this.prisma.platformFee.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          });

          const platformFeeAmount = activeFee ? Number(activeFee.amount) : 0;

          const payment = await tx.payment.create({
            data: {
              bookingId: booking.id,
              customerId,
              price: dto.companyAmount,
              totalAmount: dto.totalAmount,
              companyAmount: dto.companyAmount,
              commissionAmount: dto.commissionAmount,
              platformFeeAmount: dto.platformFeeAmount ?? platformFeeAmount,
              currency: dto.currency || 'SDG',
              status: PaymentStatus.PENDING,
              paymentMethod: dto.paymentMethod,
              transactionId: dto.transactionId,
              receiptFile: receiptFile ?? null,
            },
            include: {
              Booking: {
                include: {
                  Trip: { include: { Bus: true } },
                },
              },
            },
          });

          return {
            booking,
            payment,
            _pricing: {
              tripPrice,
              seatCount,
              baseAmount,
              platformFeeAmount,
              totalAmount: dto.totalAmount,
            },
          };
        });

        const ticket = await this.paymentService.generateTicket(
          result.booking,
          result.payment,
        );

        return {
          message: 'تم إنشاء الحجز والدفعة بنجاح',
          ...result,
          ticket,
        };
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(
          'بيانات الحجز غير صالحة. يرجى التحقق من المدخلات',
        );
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'حدث خطأ في قاعدة البيانات. يرجى المحاولة مجدداً',
        );
      }
      throw error;
    }
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

  async getActivePlatformFee() {
    return this.prisma.platformFee.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActivePaymentAccounts() {
    return this.prisma.paymentAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
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
