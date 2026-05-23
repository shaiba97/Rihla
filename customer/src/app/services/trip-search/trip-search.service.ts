import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface BackendTrip {
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

interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
  count?: number;
}

interface Trip {
  id: string;
  busName: string;
  boardingCity: string;
  destCity: string;
  tripTime: string;
  arriveTime: string;
  price: number;
  currency?: string;
  seatsLeft: number;
  busChairs?: number;
  tripDate?: string;
}

interface SearchParams {
  from: string;
  to: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class TripSearchService {
  private http = inject(HttpClient);
  private companyApiUrl = environment.apiUrl.company;

  getAllCities(): Observable<ApiResponse<string[]>> {
    return this.http.get<BackendTrip[]>(`${this.companyApiUrl}/trips/available`).pipe(
      map(trips => {
        const cities = new Set<string>();
        trips.forEach(t => {
          if (t.fromCity) cities.add(t.fromCity);
          if (t.toCity) cities.add(t.toCity);
        });
        return { data: Array.from(cities).sort() };
      })
    );
  }

  getAllTrips(): Observable<ApiResponse<Trip[]>> {
    return this.http.get<BackendTrip[]>(`${this.companyApiUrl}/trips/available`).pipe(
      map(trips => ({
        data: trips.map(t => this.mapTrip(t)).sort((a, b) => new Date(a.tripDate ?? 0).getTime() - new Date(b.tripDate ?? 0).getTime()),
        count: trips.length,
      }))
    );
  }

  searchTrips(params: SearchParams): Observable<ApiResponse<Trip[]>> {
    return this.http.post<{ success: boolean; message: string; data: BackendTrip[]; count: number }>(
      `${this.companyApiUrl}/trips/search-trips`,
      { fromCity: params.from, toCity: params.to, departureDate: params.date }
    ).pipe(
      map(response => ({
        data: (response.data ?? []).map(t => this.mapTrip(t)),
        message: response.message,
        success: response.success,
      }))
    );
  }

  private mapTrip(t: BackendTrip): Trip {
    return {
      id: t.id,
      busName: t.Bus?.name ?? 'حافلة',
      boardingCity: t.fromCity,
      destCity: t.toCity,
      tripTime: t.departureTime,
      arriveTime: t.arrivalTime,
      price: Number(t.price),
      currency: 'جنيه سوداني',
      seatsLeft: t.Bus?.chairs ?? 45,
      busChairs: t.Bus?.chairs ?? 45,
      tripDate: t.departureDate,
    };
  }
}
