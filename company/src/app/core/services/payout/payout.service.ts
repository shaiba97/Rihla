import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface PayoutTrip {
  id: string;
  fromCity: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  route: string;
  unpaidAmount: number;
  paidOut: boolean;
  hasPendingRequest: boolean;
}

export interface PayoutRequest {
  id: string;
  tripId?: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  note?: string;
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  note?: string;
  receiptFile?: string;
  createdAt: string;
  items: { trip: { id: string; fromCity: string; toCity: string } }[];
}

export interface CompanyAccount {
  accountHolderName: string | null;
  bankName: string | null;
  accountNumber: string | null;
}

export interface PayoutDashboardStats {
  totalUnpaidAmount: number;
  totalPaidAmount: number;
  pendingRequestCount: number;
}

@Injectable({ providedIn: 'root' })
export class PayoutService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.company;

  getTrips() {
    return this.http.get<{ data: PayoutTrip[] }>(`${this.api}/payout/trips`);
  }

  requestPayout(tripId?: string) {
    return this.http.post<{ data: PayoutRequest }>(`${this.api}/payout/request`, tripId ? { tripId } : {});
  }

  getHistory() {
    return this.http.get<{ data: PayoutRecord[] }>(`${this.api}/payout/history`);
  }

  getRequests() {
    return this.http.get<{ data: PayoutRequest[] }>(`${this.api}/payout/requests`);
  }

  getDashboardStats() {
    return this.http.get<{ data: PayoutDashboardStats }>(`${this.api}/payout/dashboard-stats`);
  }

  getAccount() {
    return this.http.get<{ data: CompanyAccount }>(`${this.api}/payout/account`);
  }

  updateAccount(data: CompanyAccount) {
    return this.http.put<{ data: CompanyAccount }>(`${this.api}/payout/account`, data);
  }
}
