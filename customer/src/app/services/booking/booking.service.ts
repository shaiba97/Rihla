import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  data?: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.customer;

  getBookedSeats(tripId: string): Observable<ApiResponse<number[]>> {
    return this.http.get<number[]>(`${this.apiUrl}/bookings/get-booked-seats/tripId/${tripId}`).pipe(
      map(seats => ({ data: seats }))
    );
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

  confirmPayment(
    bookingId: string,
    customerId: string,
    paymentMethod: string,
    transactionId: string,
    receiptFile: File,
    totalAmount: number,
    currency: string,
  ): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('customerId', customerId);
    formData.append('price', String(totalAmount));
    formData.append('totalAmount', String(totalAmount));
    formData.append('companyAmount', String(totalAmount));
    formData.append('commissionAmount', '0');
    formData.append('currency', currency);
    formData.append('paymentMethod', paymentMethod);
    formData.append('transactionId', transactionId);
    formData.append('receiptFile', receiptFile);
    return this.http.post<any>(`${this.apiUrl}/bookings/create-payment`, formData).pipe(
      map(result => ({ data: result }))
    );
  }
}
