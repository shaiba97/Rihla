import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.admin;

  getOverview(): Observable<any> { return this.http.get(`${this.api}/admin/financial/overview`); }
  getEarnings(period: string): Observable<any> { return this.http.get(`${this.api}/admin/financial/earnings?period=${period}`); }
  getPerformance(period: string): Observable<any> { return this.http.get(`${this.api}/admin/financial/performance?period=${period}`); }
  getPending(): Observable<any> { return this.http.get(`${this.api}/admin/financial/pending`); }
  confirmPayment(id: string): Observable<any> { return this.http.post(`${this.api}/admin/financial/confirm/${id}`, {}); }
  rejectPayment(id: string, reason?: string): Observable<any> { return this.http.post(`${this.api}/admin/financial/reject/${id}`, { reason }); }
  getExpenses(): Observable<any> { return this.http.get(`${this.api}/admin/expenses`); }
  createExpense(data: { amount: number; reason: string }): Observable<any> { return this.http.post(`${this.api}/admin/expenses`, data); }
  updateExpense(id: string, data: any): Observable<any> { return this.http.patch(`${this.api}/admin/expenses/${id}`, data); }
  deleteExpense(id: string): Observable<any> { return this.http.delete(`${this.api}/admin/expenses/${id}`); }
}
