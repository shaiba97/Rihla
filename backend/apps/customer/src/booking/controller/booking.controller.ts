import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  Put,
  Delete,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { BookingService } from '../service/booking.service';
import { PaymentService } from '../service/payment.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CreatePaymentDto,
  UpdatePaymentDto,
} from '../dto/booking.dto';

const receiptsDir = path.resolve('./uploads/receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

const receiptStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, receiptsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `receipt_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const receiptFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم — يرجى رفع صورة (jpg, png, webp)'));
  }
};

const uploadInterceptor = FileInterceptor('receiptFile', {
  storage: receiptStorage,
  fileFilter: receiptFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// interface AuthenticatedRequest extends Request {
//   user?: {
//     id: string;
//     email: string;
//     name: string;
//     role: string;
//   };
//   file?: Express.Multer.File;
// }

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
    // private readonly sessionService: SessionService,
  ) {}

  @Post('create-booking')
  @UseGuards(AuthGuard('jwt'))
  createBooking(@Body() dto: CreateBookingDto, @Req() req: Request) {
    return this.bookingService.create(dto, (req as any).user.id);
  }

  @Get('get-booked-seats/tripId/:tripId')
  async getBookedSats(@Param('tripId') tripId: string) {
    return await this.bookingService.getBookedSeats(tripId);
  }

  @Get('held-seats/:tripId')
  async getHeldSeats(@Param('tripId') tripId: string) {
    // Alias: held-seats returns same as booked-seats
    return await this.bookingService.getBookedSeats(tripId);
  }

  // @Get('bookings/select-seat/customerId/:customerId/tripId/:tripId')
  @Get('get-bookings')
  async getBookings() {
    return await this.bookingService.getBookings();
  }

  @Get(
    'get-bookings-by-properties/property1/:property1/value1/:value1/property2/:property2/value2/:value2',
  )
  async getBookingsByProperties(
    @Param('property1') property1: string,
    @Param('value1') value1: string,
    @Param('property2') property2: string,
    @Param('value2') value2: string,
  ) {
    return await this.bookingService.getBookingsByProperties(
      property1,
      value1,
      property2,
      value2,
    );
  }

  @Get('get-bookings-by-property/property/:property/value/:value')
  async getBookingsByProperty(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return await this.bookingService.getBookingsByProperty(property, value);
  }

  @Get('get-booking/property/:property/value/:value')
  async getBooking(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return await this.bookingService.getBooking(property, value);
  }

  @Get(
    'get-booking-by-properties/property1/:property1/value1/:value1/property2/:property2/value2/:value2',
  )
  async getBookingByProperties(
    @Param('property1') property1: string,
    @Param('value1') value1: string,
    @Param('property2') property2: string,
    @Param('value2') value2: string,
  ) {
    return await this.bookingService.getBookingByProperties(
      property1,
      value1,
      property2,
      value2,
    );
  }

  @Put('update-booking/:id')
  async updateBooking(@Param('id') id: string, @Body() body: UpdateBookingDto) {
    return await this.bookingService.update(id, body);
  }

  @Delete('delete-booking/:id')
  async deleteBooking(@Param('id') id: string) {
    return await this.bookingService.delete(id);
  }

  // Payment CRUD Endpoints
  @Post('create-payment')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(uploadInterceptor)
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('صورة الإيصال مطلوبة');
    }

    const receiptFile = `/uploads/receipts/${file.filename}`;
    const paymentData = { ...dto, receiptFile, customerId: (req as any).user.id };

    return await this.paymentService.create(paymentData);
  }

  @Get('get-payments')
  async getPayments() {
    return await this.paymentService.getPayments();
  }

  @Get('get-payments-by-property/property/:property/value/:value')
  async getPaymentsByProperty(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return await this.paymentService.getPaymentsByProperty(property, value);
  }

  @Get('get-payment/property/:property/value/:value')
  async getPayment(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return await this.paymentService.getPayment(property, value);
  }

  @Get(
    'get-payment-by-properties/property1/:property1/value1/:value1/property2/:property2/value2/:value2',
  )
  async getPaymentByProperties(
    @Param('property1') property1: string,
    @Param('value1') value1: string,
    @Param('property2') property2: string,
    @Param('value2') value2: string,
  ) {
    return await this.paymentService.getPaymentByProperties(
      property1,
      value1,
      property2,
      value2,
    );
  }

  @Get(
    'get-payments-by-properties/property1/:property1/value1/:value1/property2/:property2/value2/:value2',
  )
  async getPaymentsByProperties(
    @Param('property1') property1: string,
    @Param('value1') value1: string,
    @Param('property2') property2: string,
    @Param('value2') value2: string,
  ) {
    return await this.paymentService.getPaymentsByProperties(
      property1,
      value1,
      property2,
      value2,
    );
  }

  @Put('update-payment/:id')
  @UseInterceptors(uploadInterceptor)
  async updatePayment(
    @Param('id') id: string,
    @Body() body: UpdatePaymentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updateData = { ...body };

    if (file) {
      const receiptFile = `/uploads/receipts/${file.filename}`;
      updateData.receiptFile = receiptFile;
    }

    return await this.paymentService.update(id, updateData);
  }

  @Delete('delete-payment/:id')
  async deletePayment(@Param('id') id: string) {
    return await this.paymentService.delete(id);
  }
}
