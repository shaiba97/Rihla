import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Gender, BookingStatus } from '@prisma/client';

export class StartSessionDto {
  @IsString()
  tripId: string;

  @IsNumber()
  seatNumber: number;
}

export class AddPassengerDto {
  @IsString()
  sessionId: string;

  @IsString()
  passengerName: string;

  @IsNumber()
  passengerAge: number;

  @IsEnum(Gender)
  passengerGender: Gender;

  @IsString()
  passengerContact: string;
}

export class ConfirmBookingDto {
  @IsString()
  sessionId: string;
}

export class ConfirmPaymentDto {
  @IsString()
  @IsOptional()
  transferReference?: string;

  @IsString()
  @IsOptional()
  adminNotes?: string;
}