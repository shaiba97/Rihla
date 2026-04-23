import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateBusDto,
  UpdateBusDto,
  PlateDto,
  SeatStartFrom,
} from '../dto/bus.dto';
import { PrismaService } from '@app/prisma';

@Injectable()
export class BusesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBusDto: CreateBusDto, userId?: string) {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    if (!createBusDto || !createBusDto.plate) {
      throw new BadRequestException(
        'بيانات الحافلة غير صالحة - plate field is missing',
      );
    }

    if (!createBusDto.plate.numbers) {
      throw new BadRequestException('رقم اللوحة مطلوب');
    }

    const existingBus = await this.prisma.bus.findFirst({
      where: {
        plate: {
          path: ['numbers'],
          equals: createBusDto.plate.numbers,
        },
      },
    });

    if (existingBus) {
      throw new ConflictException('رقم اللوحة موجود بالفعل');
    }

    const bus = await this.prisma.bus.create({
      data: {
        companyId: userId,
        name: createBusDto.name,
        chairs: createBusDto.chairs,
        seatStartFrom: createBusDto.seatStartFrom,
        plate: createBusDto.plate,
      },
    });

    return {
      success: true,
      message: 'تم إنشاء الحافلة بنجاح',
      data: bus,
    };
  }

  async getBuses() {
    return this.prisma.bus.findMany();
  }

  async getBusesByProperty(property: string, value: string) {
    return this.prisma.bus.findMany({
      where: {
        [property]: value,
      },
    });
  }

  async getBus(property: string, value: string) {
    return this.prisma.bus.findFirst({
      where: {
        [property]: value,
      },
    });
  }

  async searchBus() {
    // TODO: Implement search logic
  }

  async update(id: string, updateBusDto: UpdateBusDto, userId?: string) {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const bus = await this.prisma.bus.findUnique({ where: { id } });

    if (!bus) {
      throw new NotFoundException('الحافلة غير موجودة');
    }

    if (bus.companyId !== userId) {
      throw new BadRequestException('You can only update your own buses');
    }

    if (updateBusDto.plate) {
      const existingBus = await this.prisma.bus.findFirst({
        where: {
          id: { not: id },
          plate: {
            path: ['numbers'],
            equals: updateBusDto.plate.numbers,
          },
        },
      });

      if (existingBus) {
        throw new ConflictException('رقم اللوحة موجود بالفعل');
      }
    }

    const updateData: {
      name?: string;
      chairs?: number;
      seatStartFrom?: SeatStartFrom;
      plate?: PlateDto;
    } = {};

    if (updateBusDto.name !== undefined) updateData.name = updateBusDto.name;
    if (updateBusDto.chairs !== undefined)
      updateData.chairs = updateBusDto.chairs;
    if (updateBusDto.seatStartFrom !== undefined)
      updateData.seatStartFrom = updateBusDto.seatStartFrom;
    if (updateBusDto.plate !== undefined) updateData.plate = updateBusDto.plate;

    const updatedBus = await this.prisma.bus.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'تم تحديث الحافلة بنجاح',
      data: updatedBus,
    };
  }

  async remove(id: string, userId?: string) {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const bus = await this.prisma.bus.findUnique({ where: { id } });

    if (!bus) {
      throw new NotFoundException('الحافلة غير موجودة');
    }

    if (bus.companyId !== userId) {
      throw new BadRequestException('You can only delete your own buses');
    }

    await this.prisma.bus.delete({ where: { id } });

    return {
      success: true,
      message: 'تم حذف الحافلة بنجاح',
    };
  }
}
