import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { Booking: number };
}

export interface GetAllParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface GetAllResponse {
  users: UserData[];
  total: number;
  page: number;
  pages: number;
}

export interface StatsResponse {
  total: number;
  customers: number;
  companies: number;
}

export interface CreateUserPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.admin;

  getAll(params: GetAllParams) {
    let p = new HttpParams();
    if (params.page) p = p.set('page', params.page);
    if (params.limit) p = p.set('limit', params.limit);
    if (params.search) p = p.set('search', params.search);
    if (params.role) p = p.set('role', params.role);
    return this.http.get<GetAllResponse>(`${this.api}/admin/users`, { params: p });
  }

  getStats() {
    return this.http.get<StatsResponse>(`${this.api}/admin/users/stats`);
  }

  getById(id: string) {
    return this.http.get<UserData>(`${this.api}/admin/users/${id}`);
  }

  toggleActive(id: string) {
    return this.http.patch<UserData>(`${this.api}/admin/users/${id}/toggle-active`, {});
  }

  create(data: CreateUserPayload) {
    return this.http.post<any>(`${this.api}/users/post-user`, data);
  }

  update(id: string, data: UpdateUserPayload) {
    return this.http.put<any>(`${this.api}/users/update-user/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete<any>(`${this.api}/users/delete-user/${id}`);
  }

  getUsersByProperty(property: string, value: string) {
    return this.http.get<UserData[]>(`${this.api}/users/get-users/property/${property}/value/${value}`);
  }

  getUser(property: string, value: string) {
    return this.http.get<UserData>(`${this.api}/users/get-user/property/${property}/value/${value}`);
  }
}
