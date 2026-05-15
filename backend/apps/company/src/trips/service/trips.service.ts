import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { CreateTripDto, UpdateTripDto } from '../dto/trips.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTripDto: CreateTripDto) {
    if (!createTripDto || !createTripDto.busId) {
      throw new BadRequestException(
        'بيانات الرحلة غير صالحة - busId field is missing',
      );
    }

    const bus = await this.prisma.bus.findUnique({
      where: { id: createTripDto.busId },
    });

    if (!bus) {
      throw new NotFoundException('الحافلة غير موجودة');
    }

    const trip = await this.prisma.trip.create({
      data: {
        busId: createTripDto.busId,
        departureDate: createTripDto.departureDate,
        departureTime: createTripDto.departureTime,
        presence_time: 'قبل ساعة',
        fromState: createTripDto.fromState,
        fromCity: createTripDto.fromCity,
        fromStation: createTripDto.fromStation,
        arrivalTime: createTripDto.arrivalTime,
        arrivalDate: createTripDto.arrivalDate,
        toState: createTripDto.toState,
        toCity: createTripDto.toCity,
        toStation: createTripDto.toStation,
        status: (createTripDto.status as any) || 'SCHEDULED',
        price: createTripDto.price,
      },
    });

    return {
      success: true,
      message: 'تم إنشاء الرحلة بنجاح',
      data: trip,
    };
  }

  async getTrips() {
    return this.prisma.trip.findMany({
      include: {
        Bus: true,
        Booking: {
          include: { TicketPDF: true },
        },
      },
    });
  }

  async getTripsByProperty(property: string, value: string) {
    return this.prisma.trip.findMany({
      where: { [property]: value },
      include: {
        Bus: true,
        Booking: { include: { TicketPDF: true } },
      },
    });
  }

  // async searchTrips(searchCriteria: {
  //   fromCity: string;
  //   toCity: string;
  //   departureDate: any | Date;
  // }) {
  //   const trips = await this.prisma.trip.findMany({
  //     where: {
  //       fromCity: searchCriteria.fromCity,
  //       toCity: searchCriteria.toCity,
  //       departureDate: {
  //         gte: new Date(searchCriteria.departureDate),
  //       },
  //     },
  //     include: {
  //       bus: true,
  //     },
  //     orderBy: [{ departureDate: 'asc' }],
  //   });

  //   console.log(trips);

  //   return {
  //     success: true,
  //     message: `تم العثور على ${trips.length} رحلة`,
  //     data: trips,
  //     count: trips.length,
  //   };
  // }

  async searchTrips(searchCriteria: {
    fromCity?: string;
    toCity?: string;
    departureDate?: string | Date;
  }) {
    // 1. Initialize an empty filter object
    const where: any = {};

    // 2. Only add filters if the values actually exist
    if (searchCriteria.fromCity) {
      where.fromCity = searchCriteria.fromCity;
    }

    if (searchCriteria.toCity) {
      where.toCity = searchCriteria.toCity;
    }

    // 3. Robust Date Validation
    if (searchCriteria.departureDate) {
      const parsedDate = new Date(searchCriteria.departureDate);
      // Only add to 'where' if the date is actually a valid date
      if (!isNaN(parsedDate.getTime())) {
        where.departureDate = {
          gte: parsedDate,
          // Optional: match only within that specific day
          lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000),
        };
      }
    }

    // 4. Run the query with the dynamically built 'where' object
    const trips = await this.prisma.trip.findMany({
      where: {
        AND: [where],
      },
      include: {
        Bus: true,
        Booking: { include: { TicketPDF: true } },
      },
      orderBy: [{ departureDate: 'asc' }],
    });

    return {
      success: true,
      message: `تم العثور على ${trips.length} رحلة`,
      data: trips,
      count: trips.length,
    };
  }

  async getTrip(property: string, value: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { [property]: value },
      include: {
        Bus: true,
        Booking: { include: { TicketPDF: true } },
      },
    });

    if (!trip) {
      throw new NotFoundException('الرحلة غير موجودة');
    }

    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      throw new NotFoundException('الرحلة غير موجودة');
    }

    if (updateTripDto.busId) {
      const bus = await this.prisma.bus.findUnique({
        where: { id: updateTripDto.busId },
      });

      if (!bus) {
        throw new NotFoundException('CANT FIND BUS');
      }
    }

    const updateData: any = {};

    if (updateTripDto.busId !== undefined)
      updateData.busId = updateTripDto.busId;
    if (updateTripDto.presenceTime !== undefined)
      updateData.presence_time = updateTripDto.presenceTime;
    if (updateTripDto.departureDate !== undefined)
      updateData.departureDate = new Date(updateTripDto.departureDate);
    if (updateTripDto.departureTime !== undefined)
      updateData.departureTime = new Date(updateTripDto.departureTime);
    if (updateTripDto.fromState !== undefined)
      updateData.fromState = updateTripDto.fromState;
    if (updateTripDto.fromCity !== undefined)
      updateData.fromCity = updateTripDto.fromCity;
    if (updateTripDto.fromStation !== undefined)
      updateData.fromStation = updateTripDto.fromStation;
    if (updateTripDto.arrivalTime !== undefined)
      updateData.arrivalTime = updateTripDto.arrivalTime;
    if (updateTripDto.arrivalDate !== undefined)
      updateData.arrivalDate = updateTripDto.arrivalDate;
    if (updateTripDto.toState !== undefined)
      updateData.toState = updateTripDto.toState;
    if (updateTripDto.toCity !== undefined)
      updateData.toCity = updateTripDto.toCity;
    if (updateTripDto.toStation !== undefined)
      updateData.toStation = updateTripDto.toStation;

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        Bus: true,
        Booking: { include: { TicketPDF: true } },
      },
    });

    return {
      success: true,
      message: 'trip updated successfully',
      data: updatedTrip,
    };
  }

  async remove(id: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      throw new NotFoundException('trip not found');
    }

    await this.prisma.trip.delete({ where: { id } });

    return {
      success: true,
      message: 'trip deleted successfully',
    };
  }
}
