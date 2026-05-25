import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Trip {
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

export interface Booking {
  id: string;
  passengerName: string;
  passengerAge: number;
  passengerGender: string;
  seatNumber: number;
  status: string;
}

export interface TripSearchParams {
  fromCity: string;
  toCity:   string;
  departureDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class Trips {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.company;

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/trips/available`);
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

  searchTrips(
    params: TripSearchParams
  ): Observable<{ data: Trip[] }> {
    return this.http.post<{ data: Trip[] }>(
      `${this.apiUrl}/trips/search-trips`,
      { fromCity: params.fromCity, toCity: params.toCity, departureDate: params.departureDate }
    );
  }

}
 