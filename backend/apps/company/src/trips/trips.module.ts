import { Module } from '@nestjs/common';
import { TripsController } from './controller/trips.controller';
import { TripsService } from './service/trips.service';
import { PrismaModule } from '@app/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
