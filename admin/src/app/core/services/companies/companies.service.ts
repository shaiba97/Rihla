import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.admin;
  getAll() { return this.http.get(`${this.api}/admin/users?role=COMPANY`); }
  getOne(id: string) { return this.http.get(`${this.api}/admin/users/${id}`); }
  toggleActive(id: string) { return this.http.patch(`${this.api}/admin/users/${id}/toggle-active`, {}); }
  remove(id: string) { return this.http.delete(`${this.api}/admin/users/${id}`); }
}
