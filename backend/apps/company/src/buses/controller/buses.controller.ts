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
import { BusesService } from '../service/buses.service';
import { CreateBusDto, UpdateBusDto } from '../dto/bus.dto';
import { JwtAuthGuard } from '@app/auth';

@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Post('post-bus')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() createBusDto: CreateBusDto) {
    return this.busesService.create(createBusDto, req.user?.id);
  }

  @Get('get-buses')
  async getBuses() {
    return this.busesService.getBuses();
  }

  @Get('get-buses/property/:property/value/:value')
  async getBusesByProperty(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return this.busesService.getBusesByProperty(property, value);
  }

  @Get('get-bus/property/:property/value/:value')
  async getBus(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return this.busesService.getBus(property, value);
  }

  // @Get('search-bus')
  // async searchBus(@Query() query: any) {
  //   return this.busesService.searchBus(query);
  // }

  // @Post('search-bus')
  // async searchBusPost(@Body() searchCriteria: any) {
  //   return this.busesService.searchBus(searchCriteria);
  // }

  @Put('update-bus/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateBusDto: UpdateBusDto,
  ) {
    return this.busesService.update(id, updateBusDto, req.user?.id);
  }

  @Delete('delete-bus/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.busesService.remove(id, req.user?.id);
  }
}
