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
        presence_time: new Date(createTripDto.presenceTime),
        departureDate: new Date(createTripDto.departureDate),
        departureTime: new Date(createTripDto.departureTime),
        fromState: createTripDto.fromState,
        fromCity: createTripDto.fromCity,
        fromStation: createTripDto.fromStation,
        arrivalTime: new Date(createTripDto.arrivalTime),
        arrivalDate: new Date(createTripDto.arrivalDate),
        toState: createTripDto.toState,
        toCity: createTripDto.toCity,
        toStation: createTripDto.toStation,
        status: (createTripDto.status as any) || 'SCHEDULED',
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
        bus: true,
      },
    });
  }

  async getTripsByProperty(property: string, value: string) {
    return this.prisma.trip.findMany({
      where: { [property]: value },
      include: {
        bus: true,
      },
    });
  }

  async getTrip(property: string, value: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { [property]: value },
      include: {
        bus: true,
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

    const updateData: Partial<{
      busId: string;
      presence_time: Date;
      departureDate: Date;
      departureTime: Date;
      fromState: string;
      fromCity: string;
      fromStation: string;
      arrivalTime: Date;
      arrivalDate: Date;
      toState: string;
      toCity: string;
      toStation: string;
    }> = {};

    if (updateTripDto.busId !== undefined)
      updateData.busId = updateTripDto.busId;
    if (updateTripDto.presenceTime !== undefined)
      updateData.presence_time = new Date(updateTripDto.presenceTime);
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
      updateData.arrivalTime = new Date(updateTripDto.arrivalTime);
    if (updateTripDto.arrivalDate !== undefined)
      updateData.arrivalDate = new Date(updateTripDto.arrivalDate);
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
        bus: true,
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
