import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface FinancialSummary {
  totalRevenue: number;
  totalCommission: number;
  netEarnings: number;
  thisMonthRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  dailyRevenue: { date: string; amount: number }[];
  topTrips: { tripId: string; from: string; to: string; revenue: number; bookings: number }[];
  recentPayments: { id: string; bookingId: string; totalAmount: number; companyAmount: number; commissionAmount: number; paymentMethod: string; createdAt: string; from?: string; to?: string }[];
}

@Injectable({ providedIn: 'root' })
export class FinancialsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.company;

  getSummary() {
    return this.http.get<{ data: FinancialSummary }>(`${this.api}/payment/summary`);
  }

  getPerformance(period: string) {
    return this.http.get<{ data: any[] }>(`${this.api}/payment/performance?period=${period}`);
  }
}
