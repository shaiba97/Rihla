import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TripDetails {
  id: string;
  busId: string;
  fromState: string;
  toState: string;
  fromCity: string;
  fromStation: string;
  toCity: string;
  toStation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
  status: string;
  Bus?: {
    id: string;
    name: string;
    chairs: number;
    seatStartFrom: string;
    plate: {
      arabic: string;
      english: string;
      numbers: string;
    };
  };
  bookings?: Booking[];
  createdAt: string;
  updatedAt: string;
}



export interface PassengerItem {
  name:   string;
  age:    number;
  gender: 'MALE' | 'FEMALE';
}

export interface CreateBookingDto {
  tripId:           string;
  seatNumber:       number;
  passenger:        PassengerItem[];
  passengerContact: string;
}

export interface CreatePaymentDto {
  bookingId: string;
  customerId: string;
  totalAmount: number;
  companyAmount: number;
  commissionAmount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transferReference?: string;
  adminNotes?: string;
  confirmedBy?: string;
  paidAt?: Date;
}


// Interfaces for API responses
export interface Booking {
  id: string;
  customerId: string;
  tripId: string;
  seatNumber: number;
  passengerContact: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  passenger: any;
  Trip?: any;
  Payment?: any;
  TicketPDF?: any;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  price: number;
  totalAmount: number;
  companyAmount: number;
  commissionAmount: number;
  currency: string;
  status: string;
  transactionId?: string;
  receiptFile?: string;
  createdAt: string;
  updatedAt: string;
  Booking?: Booking;
}

export interface CreateBookingRequest {
  customerId: string;
  tripId: string;
  seatNumbers: number[];  // ✅ Changed from seatNumber to seatNumbers (array)
  passengerContact: string;
  passenger: Array<{
    name: string;
    age: number;
    gender: 'MALE' | 'FEMALE';
  }>;
  status?: string;
}

export interface UpdateBookingRequest {
  customerId?: string;
  tripId?: string;
  seatNumber?: number;
  passengerContact?: string;
  passenger?: Array<{
    name: string;
    age: number;
    gender: 'MALE' | 'FEMALE';
  }>;
  status?: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  customerId: string;
  price: number;
  totalAmount: number;
  companyAmount: number;
  commissionAmount: number;
  currency?: string;
  status?: string;
  transactionId?: string;
  receiptFile?: string;
  paymentMethod: string
}

export interface UpdatePaymentRequest {
  bookingId?: string;
  customerId?: string;
  price?: number;
  totalAmount?: number;
  companyAmount?: number;
  commissionAmount?: number;
  currency?: string;
  status?: string;
  transactionId?: string;
  receiptFile?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http    = inject(HttpClient);
  private baseUrl = `${environment.apiUrl.customer}/bookings`;

  // ========== BOOKING CRUD OPERATIONS ==========

  // Create Booking
  createBooking(
    dto: CreateBookingRequest
  ): Observable<Booking> {
    return this.http.post<Booking>(
      `${this.baseUrl}/create-booking`,
      dto
    );
  }


  // Get All Bookings
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.baseUrl}/get-bookings`
    );
  }

  // Get Bookings by Properties (two properties)
  getBookingsByProperties(
    property1: string,
    value1: string,
    property2: string,
    value2: string
  ): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.baseUrl}/get-bookings-by-properties/property1/${property1}/value1/${value1}/property2/${property2}/value2/${value2}`
    );
  }

  // Get Bookings by Property (single property)
  getBookingsByProperty(
    property: string,
    value: string
  ): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.baseUrl}/get-bookings-by-property/property/${property}/value/${value}`
    );
  }

  // Get Single Booking by Property
  getBooking(
    property: string,
    value: string
  ): Observable<Booking> {
    return this.http.get<Booking>(
      `${this.baseUrl}/get-booking/property/${property}/value/${value}`
    );
  }

  // Get Single Booking by Properties (two properties)
  getBookingByProperties(
    property1: string,
    value1: string,
    property2: string,
    value2: string
  ): Observable<Booking> {
    return this.http.get<Booking>(
      `${this.baseUrl}/get-booking-by-properties/property1/${property1}/value1/${value1}/property2/${property2}/value2/${value2}`
    );
  }

  // Update Booking
  updateBooking(
    id: string,
    body: UpdateBookingRequest
  ): Observable<Booking> {
    return this.http.put<Booking>(
      `${this.baseUrl}/update-booking/${id}`,
      body
    );
  }

  // Delete Booking
  deleteBooking(
    id: string
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/delete-booking/${id}`
    );
  }

  // ========== PAYMENT CRUD OPERATIONS ==========

  // Create Payment (with file upload)
  createPayment(
    dto: CreatePaymentRequest,
    receiptFile?: File
  ): Observable<any> {
    const formData = new FormData();
    
    // Add all payment data fields
    Object.keys(dto).forEach(key => {
      if (dto[key as keyof CreatePaymentRequest] !== undefined) {
        formData.append(key, String(dto[key as keyof CreatePaymentRequest]));
      }
    });

    // Add receipt file if provided
    if (receiptFile) {
      formData.append('receiptFile', receiptFile, receiptFile.name);
    }

    return this.http.post(
      `${this.baseUrl}/create-payment`,
      formData
    );
  }

  // Get All Payments
  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.baseUrl}/get-payments`
    );
  }

  // Get Payments by Properties (two properties)
  getPaymentsByProperties(
    property1: string,
    value1: string,
    property2: string,
    value2: string
  ): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.baseUrl}/get-payments-by-properties/property1/${property1}/value1/${value1}/property2/${property2}/value2/${value2}`
    );
  }

  // Get Payments by Property (single property)
  getPaymentsByProperty(
    property: string,
    value: string
  ): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.baseUrl}/get-payments-by-property/property/${property}/value/${value}`
    );
  }

  // Get Single Payment by Property
  getPayment(
    property: string,
    value: string
  ): Observable<Payment> {
    return this.http.get<Payment>(
      `${this.baseUrl}/get-payment/property/${property}/value/${value}`
    );
  }

  // Get Single Payment by Properties (two properties)
  getPaymentByProperties(
    property1: string,
    value1: string,
    property2: string,
    value2: string
  ): Observable<Payment> {
    return this.http.get<Payment>(
      `${this.baseUrl}/get-payment-by-properties/property1/${property1}/value1/${value1}/property2/${property2}/value2/${value2}`
    );
  }

  // Update Payment (with optional file upload)
  updatePayment(
    id: string,
    body: UpdatePaymentRequest,
    receiptFile?: File
  ): Observable<any> {
    const formData = new FormData();
    
    // Add all payment data fields
    Object.keys(body).forEach(key => {
      if (body[key as keyof UpdatePaymentRequest] !== undefined) {
        formData.append(key, String(body[key as keyof UpdatePaymentRequest]));
      }
    });

    // Add receipt file if provided
    if (receiptFile) {
      formData.append('receiptFile', receiptFile, receiptFile.name);
    }

    return this.http.put(
      `${this.baseUrl}/update-payment/${id}`,
      formData
    );
  }

  // Delete Payment
  deletePayment(
    id: string
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/delete-payment/${id}`
    );
  }

  // ========== HELPER METHODS ==========

  // Get Trip Details (if needed)
  getTripDetails(
    tripId: string
  ): Observable<{ data: any }> {
    return this.http.get<{ data: any }>(
      `${this.baseUrl}/trips/get-trip/id/${tripId}`
    );
  }

  // Get Booked Seats for a Trip (if needed)
  getBookedSeats(
    tripId: string
  ): Observable<{ data: number[] }> {
    return this.http.get<{ data: number[] }>(
      `${this.baseUrl}/get-booked-seats/tripId/${tripId}`
    );
  }

  // Get Held Seats (seats other customers are currently holding)
  getHeldSeats(
    tripId: string
  ): Observable<{ data: number[] }> {
    return this.http.get<{ data: number[] }>(
      `${this.baseUrl}/held-seats/${tripId}`
    );
  }
}
