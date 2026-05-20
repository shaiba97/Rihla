import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentAccountsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.admin;
  getAll() { return this.http.get(`${this.api}/admin/payment-accounts`); }
  create(data: any) { return this.http.post(`${this.api}/admin/payment-accounts`, data); }
  update(id: string, data: any) { return this.http.patch(`${this.api}/admin/payment-accounts/${id}`, data); }
  toggleActive(id: string) { return this.http.patch(`${this.api}/admin/payment-accounts/${id}/toggle-active`, {}); }
  remove(id: string) { return this.http.delete(`${this.api}/admin/payment-accounts/${id}`); }
}
