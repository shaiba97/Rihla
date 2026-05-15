import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CustomerData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  private readonly DATA_KEY = 'rihla_customer_data';
  private readonly TOKEN_KEY = 'rihla_access_token';
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.customer;

  readonly customerData = signal<CustomerData | null>(this.loadFromStorage());
  readonly customerName = computed(() => this.customerData()?.name ?? '');
  readonly customerPhone = computed(() => this.customerData()?.phone ?? '');
  readonly customerEmail = computed(() => this.customerData()?.email ?? '');
  readonly customerRole = computed(() => this.customerData()?.role ?? '');
  readonly token = signal<string | null>(this.loadTokenFromStorage());
  readonly isLoggedIn = computed(() => !!this.token() && !!this.customerData());

  login(data: { phone?: string; email?: string; password: string }) {
    return this.http
      .post<any>(`${this.apiUrl}/users/post-login`, data)
      .pipe();
  }

  register(data: { name: string; phone?: string; email?: string; password: string }) {
    return this.http
      .post<any>(`${this.apiUrl}/users/post-user`, {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        role: 'USER',
      })
      .pipe();
  }

  setSession(token: string, user: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);

    const customer: CustomerData = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };
    this.saveToStorage(customer);
    this.customerData.set(customer);
  }

  updateProfile(data: { name?: string; phone?: string; email?: string }) {
    const id = this.customerData()?.id;
    if (!id) throw new Error('User not authenticated');
    return this.http
      .put<any>(`${this.apiUrl}/users/update-user/${id}`, data)
      .pipe();
  }

  updateLocalProfile(data: { name?: string; phone?: string; email?: string }): void {
    const current = this.customerData();
    if (!current) return;
    const updated = { ...current, ...data };
    this.saveToStorage(updated);
    this.customerData.set(updated);
  }

  deleteAccount() {
    const id = this.customerData()?.id;
    if (!id) throw new Error('User not authenticated');
    return this.http
      .delete<any>(`${this.apiUrl}/users/delete-user/${id}`)
      .pipe();
  }

  logout(): void {
    localStorage.removeItem(this.DATA_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.customerData.set(null);
    this.token.set(null);
  }

  private loadFromStorage(): CustomerData | null {
    try {
      const raw = localStorage.getItem(this.DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(data: CustomerData): void {
    localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
  }

  private loadTokenFromStorage(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }
}
