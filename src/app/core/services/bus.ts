import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Plate {
  arabic: string;
  english: string;
  numbers: string;
}

export interface Bus {
  id: string;
  name: string;
  chairs: number;
  seatStartFrom: 'LEFT' | 'RIGHT';
  plate: Plate;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BusService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.company;

  getBuses() {
    return this.http.get<Bus[]>(`${this.apiUrl}/buses/get-buses`);
  }

  getBusesByProperty(property: string, value: string) {
    return this.http.get<Bus[]>(
      `${this.apiUrl}/buses/get-buses/property/${property}/value/${value}`
    );
  }

  getBusByProperty(property: string, value: string) {
    return this.http.get<Bus>(
      `${this.apiUrl}/buses/get-bus/property/${property}/value/${value}`
    );
  }

  createBus(data: Partial<Bus>) {
    return this.http.post<Bus>(`${this.apiUrl}/buses/post-bus`, data);
  }

  deleteBus(id: string) {
    return this.http.delete(`${this.apiUrl}/buses/delete-bus/${id}`);
  }

  updateBus(id: string, data: Partial<Bus>) {
    return this.http.put<Bus>(`${this.apiUrl}/buses/update-bus/${id}`, data);
  }
}