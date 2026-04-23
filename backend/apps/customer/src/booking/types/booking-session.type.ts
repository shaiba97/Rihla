export interface BookingSession {
  sessionId: string;
  customerId: string;
  tripId: string;
  seatNumber: number;
  price: number;
  passengerName?: string;
  passengerAge?: number;
  passengerGender?: 'MALE' | 'FEMALE';
  passengerContact?: string;
  companyId?: string;
  bankName?: string;
  bankAccountNumber?: string;
  paymentInstructions?: string;
  step: 1 | 2 | 3;
  createdAt: string;
}

export interface PaymentInstructions {
  bankName: string;
  accountNumber: string;
  instructions: string;
  amount: number;
  currency: string;
}