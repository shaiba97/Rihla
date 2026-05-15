export type BookingStep = 'seat' | 'passenger' | 'payment';

export type SeatStatus = 'available' | 'reserved' | 'held' | 'booked';

export interface SeatMap {
  seatNumber: number;
  status: SeatStatus;
  gender?: 'MALE' | 'FEMALE' | null;
}

export interface PassengerForm {
  seatNumber: number;
  name: string;
  age: number | null;
  gender: 'MALE' | 'FEMALE' | null;
}

export interface ContactForm {
  countryCode: string;
  whatsappNumber: string;
}
