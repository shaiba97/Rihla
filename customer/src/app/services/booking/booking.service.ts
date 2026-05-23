import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  data?: T;
  message?: string;
}

export interface BackendTrip {
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
    plate: { arabic: string; english: string; numbers: string };
  };
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.customer;
  private companyApiUrl = environment.apiUrl.company;

  getTripDetails(tripId: string): Observable<BackendTrip | null> {
    return this.http.get<BackendTrip[]>(`${this.companyApiUrl}/trips/get-trips`).pipe(
      map(trips => trips.find(t => t.id === tripId) ?? null)
    );
  }

  getBookedSeats(tripId: string): Observable<ApiResponse<number[]>> {
    return this.http.get<number[]>(`${this.apiUrl}/bookings/get-booked-seats/tripId/${tripId}`).pipe(
      map(seats => ({ data: seats }))
    );
  }

  getActiveFee(): Observable<{ amount: number; currency: string } | null> {
    return this.http.get<any>(`${this.apiUrl}/bookings/active-fee`);
  }

  getActivePaymentAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/payment-accounts`);
  }

  getSupportContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/support-contacts`);
  }

  createBooking(data: {
    tripId: string;
    seatNumbers: number[];
    passenger: { name: string; age: number; gender: string }[];
    passengerContact: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.apiUrl}/bookings/create-booking`, data).pipe(
      map(booking => ({ data: booking }))
    );
  }

  getMyBookings(property: string, value: string): Observable<ApiResponse<any[]>> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/get-bookings-by-property/property/${property}/value/${value}`).pipe(
      map(bookings => ({ data: bookings }))
    );
  }

  getBookingById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<any>(`${this.apiUrl}/bookings/${id}`).pipe(
      map(booking => ({ data: booking }))
    );
  }

  createBookingWithPayment(data: {
    tripId: string;
    seatNumbers: number[];
    passenger: { name: string; age: number; gender: string }[];
    passengerContact: string;
    totalAmount: number;
    baseAmount: number;
    platformFeeAmount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    receiptFile?: File;
  }): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('tripId', data.tripId);
    formData.append('seatNumbers', JSON.stringify(data.seatNumbers));
    formData.append('passenger', JSON.stringify(data.passenger));
    formData.append('passengerContact', data.passengerContact);
    formData.append('totalAmount', String(data.totalAmount));
    formData.append('companyAmount', String(data.baseAmount));
    formData.append('commissionAmount', '0');
    formData.append('platformFeeAmount', String(data.platformFeeAmount));
    formData.append('currency', data.currency);
    formData.append('paymentMethod', data.paymentMethod);
    formData.append('transactionId', data.transactionId);
    if (data.receiptFile) {
      formData.append('receiptFile', data.receiptFile);
    }
    return this.http.post<any>(`${this.apiUrl}/bookings/create-booking-with-payment`, formData).pipe(
      map(result => ({ data: result })),
    );
  }

  confirmPayment(data: {
    bookingId: string;
    customerId: string;
    paymentMethod: string;
    transactionId: string;
    totalAmount: number;
    baseAmount: number;
    platformFeeAmount: number;
    currency: string;
    receiptFile?: File;
  }): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('bookingId', data.bookingId);
    formData.append('customerId', data.customerId);
    formData.append('price', String(data.baseAmount));
    formData.append('totalAmount', String(data.totalAmount));
    formData.append('companyAmount', String(data.baseAmount));
    formData.append('commissionAmount', '0');
    formData.append('platformFeeAmount', String(data.platformFeeAmount));
    formData.append('currency', data.currency);
    formData.append('paymentMethod', data.paymentMethod);
    formData.append('transactionId', data.transactionId);
    if (data.receiptFile) {
      formData.append('receiptFile', data.receiptFile);
    }
    return this.http.post<any>(`${this.apiUrl}/bookings/create-payment`, formData).pipe(
      map(result => ({ data: result }))
    );
  }
}
