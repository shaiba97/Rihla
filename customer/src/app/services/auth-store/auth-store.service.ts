import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';

export interface CustomerData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  phone?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    name: string;
  };
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface MeResponse {
  data: {
    success: boolean;
    message?: string;
    data?: {
      id: string;
      name: string;
      email: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    role: string;
  };
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  message: string;
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

  login(data: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/post-login`, data);
  }

  register(data: RegisterPayload): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.apiUrl}/users/post-user`, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: data.password,
      role: 'USER',
    });
  }

  setSession(token: string, user: { id: string; name: string; phone?: string | null; email?: string | null; role: string }): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);

    const customer: CustomerData = {
      id: user.id,
      name: user.name,
      phone: user.phone ?? undefined,
      email: user.email ?? undefined,
      role: user.role,
    };
    this.saveToStorage(customer);
    this.customerData.set(customer);
  }

  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/users/me`);
  }

  logout(): void {
    const currentToken = this.token();
    if (currentToken) {
      this.http.post<LogoutResponse>(`${this.apiUrl}/users/logout`, {}).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
    this.clearLocalSession();
  }

  updateProfile(data: { name?: string; phone?: string; email?: string }): Observable<UpdateProfileResponse> {
    const id = this.customerData()?.id;
    if (!id) throw new Error('User not authenticated');
    return this.http.put<UpdateProfileResponse>(`${this.apiUrl}/users/update-user/${id}`, data);
  }

  updateLocalProfile(data: { name?: string; phone?: string; email?: string }): void {
    const current = this.customerData();
    if (!current) return;
    const updated = { ...current, ...data };
    this.saveToStorage(updated);
    this.customerData.set(updated);
  }

  deleteAccount(): Observable<DeleteAccountResponse> {
    const id = this.customerData()?.id;
    if (!id) throw new Error('User not authenticated');
    return this.http.delete<DeleteAccountResponse>(`${this.apiUrl}/users/delete-user/${id}`);
  }

  private clearLocalSession(): void {
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
