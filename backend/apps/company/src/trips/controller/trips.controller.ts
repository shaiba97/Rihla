import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TripsService } from '../service/trips.service';
import { CreateTripDto, UpdateTripDto } from '../dto/trips.dto';
import { JwtAuthGuard } from '@app/auth';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('post-trip')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Get('get-trips')
  async getTrips() {
    return this.tripsService.getTrips();
  }

  @Get('get-trips/property/:property/value/:value')
  async getTripsByProperty(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return this.tripsService.getTripsByProperty(property, value);
  }

  @Get('get-trip/property/:property/value/:value')
  async getTrip(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return this.tripsService.getTrip(property, value);
  }
  // @Get('search-trip')
  // async searchTrip(@Query() query: any) {
  //   return this.tripsService.searchTrip(query);
  // }

  // @Post('search-trip')
  // async searchTripPost(@Body() searchCriteria: any) {
  //   return this.tripsService.searchTrip(searchCriteria);
  // }

  @Put('update-trip/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Delete('delete-trip/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.tripsService.remove(id);
  }
}
