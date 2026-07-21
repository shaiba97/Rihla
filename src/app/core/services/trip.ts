import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface Trip {
  id: string;
  busId: string;
  fromState: string;
  toState: string;
  fromCity: string;
  fromStation: string;
  toCity: string;
  toStation: string;
  departureDate: any;
  departureTime: any;
  arrivalDate: any;
  arrivalTime: any;
  price: number;
  availableChairs: number;
  status: string;
  bus?: {
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
  Booking?: Booking[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  passenger: [{
    name: string;
    age: number;
    gender: string;
  }]
  seatNumbers: number[];
  status: string;
  TicketPDF?: TicketPDF;
}

export interface CreateTripData {
  fromState: string;
  toState: string;
  fromCity: string;
  fromStation: string;
  toCity: string;
  toStation: string;
  departureDate: any;
  departureTime: any;
  arrivalDate: any;
  arrivalTime: any;
  price: number;
  status: string;
  busId: string;
}

export interface TicketPDF{
  id: string;
  bookingId: string;
  ticketUrl: string;
}

@Injectable({ providedIn: 'root' })
export class TripService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.company;

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/trips/get-trips`);
  }


  getTripsByProperty(property: string, value: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(
      `${this.apiUrl}/trips/get-trips/property/${property}/value/${value}`
    );
  }

  getTripByProperty(property: string, value: string): Observable<Trip> {
    return this.http.get<Trip>(
      `${this.apiUrl}/trips/get-trip/property/${property}/value/${value}`
    );
  }

  createTrip(data: CreateTripData): Observable<Trip> {
    return this.http.post<Trip>(`${this.apiUrl}/trips/post-trip`, data);
  }

  updateTrip(id: string, data: Partial<Trip>): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/trips/update-trip/${id}`, data);
  }

  deleteTrip(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/trips/delete-trip/${id}`);
  }

  downloadPassengers(tripId: string): string {
    return `${this.apiUrl}/trips/download-passengers/${tripId}`;
  }

  getPassengersPdfUrl(tripId: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/trips/get-passengers-pdf/${tripId}`);
  }

  generatePassengersPdf(trip: any, bookings: any[]): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.apiUrl}/trips/generate-passengers-pdf`, { trip, bookings });
  }

  createBooking(tripId: string, data: { seatNumbers: number[]; passenger: any; customerId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/trips/create-booking/${tripId}`, data);
  }

  cancelBooking(bookingId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/trips/cancel-booking/${bookingId}`);
  }

  getTripBookings(tripId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/trips/bookings/${tripId}`);
  }
}