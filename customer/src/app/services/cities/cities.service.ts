import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface State {
  state: string;
  cities: string[];
}

@Injectable({ providedIn: 'root' })
export class CitiesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.customer;

  getStates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/cities/states`);
  }

  getAllCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/cities`);
  }

  getStatesWithCities(): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiUrl}/cities/states-with-cities`);
  }
}
