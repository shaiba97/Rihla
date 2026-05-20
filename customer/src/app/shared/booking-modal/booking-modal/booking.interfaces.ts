export type BookingStep = 'seat' | 'passenger' | 'payment';

export type SeatStatus = 'available' | 'booked' | 'selected';

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

export type PaymentGateway = string;

export interface BookingSession {
  tripId: string;
  ticketId: string;
  selectedSeats: number[];
  contactForm: ContactForm;
  passengers: PassengerForm[];
  price: number;
  currency: string;
}
