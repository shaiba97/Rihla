import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlatformFeeService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.admin;

  getAll(): Observable<any> { return this.http.get(`${this.api}/admin/platform-fee`); }
  getActive(): Observable<any> { return this.http.get(`${this.api}/admin/platform-fee/active`); }
  create(data: { amount: number; currency?: string; label?: string }): Observable<any> { return this.http.post(`${this.api}/admin/platform-fee`, data); }
  update(id: string, data: any): Observable<any> { return this.http.patch(`${this.api}/admin/platform-fee/${id}`, data); }
  activate(id: string): Observable<any> { return this.http.patch(`${this.api}/admin/platform-fee/${id}/activate`, {}); }
  remove(id: string): Observable<any> { return this.http.delete(`${this.api}/admin/platform-fee/${id}`); }
}
