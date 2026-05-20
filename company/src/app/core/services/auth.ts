import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id:    string;
  name:  string;
  email: string | null;
  phone?: string | null;
  role:  'COMPANY' | 'CUSTOMER' | 'ADMIN';
}

export interface LoginResponse {
  message: string;
  token:   string;
  user:    AuthUser;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id:        string;
    name:      string;
    email:     string | null;
    phone?:    string | null;
    role:      string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface MeResponse {
  data: {
    success: boolean;
    message?: string;
    data?: {
      id:        string;
      name:      string;
      email:     string | null;
      role:      string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?:   AuthUser;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _user  = signal<AuthUser | null>(null);
  private _token = signal<string | null>(null);

  private apiUrl = environment.apiUrl.company

  isLoggedIn   = computed(() => !!this._token());
  currentUser  = computed(() => this._user());
  token        = computed(() => this._token());
  companyName  = computed(() => this._user()?.name ?? 'اسم الشركة');
  userName     = computed(() => this._user()?.name ?? 'المستخدم');
  customerEmail = computed(() => this._user()?.email ?? '');

  constructor() {
    const savedToken = localStorage.getItem('company_token');
    const savedUser  = localStorage.getItem('company_user');

    if (savedToken) {
      this._token.set(savedToken);
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          this._user.set(parsedUser);
        } else {
          localStorage.removeItem('company_user');
        }
      } catch {
        localStorage.removeItem('company_user');
      }
    }
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/users/post-login`,
      { phone: identifier, password }
    );
  }

  register(data: {
    name: string;
    phone?: string;
    email?: string;
    password: string;
    role: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/users/post-user`,
      data
    );
  }

  setSession(token: string, user: AuthUser): void {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem('company_token', token);
    localStorage.setItem('company_user', JSON.stringify(user));
  }

  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/users/me`);
  }

  logout(): void {
    const token = this._token();
    if (token) {
      this.http.post<LogoutResponse>(
        `${this.apiUrl}/users/logout`, {}
      ).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
    this.clearLocalSession();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  updateProfile(data: { name?: string; email?: string }): Observable<UpdateProfileResponse> {
    const id = this._user()?.id;
    if (!id) throw new Error('Not authenticated');
    return this.http.put<UpdateProfileResponse>(
      `${this.apiUrl}/users/update-user/${id}`, data
    );
  }

  updateLocalProfile(data: { name?: string; email?: string }): void {
    const current = this._user();
    if (!current) return;
    const updated = { ...current, ...data };
    this._user.set(updated);
    localStorage.setItem('company_user', JSON.stringify(updated));
  }

  deleteAccount(): Observable<DeleteAccountResponse> {
    const id = this._user()?.id;
    if (!id) throw new Error('Not authenticated');
    return this.http.delete<DeleteAccountResponse>(
      `${this.apiUrl}/users/delete-user/${id}`
    );
  }

  private clearLocalSession(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('company_token');
    localStorage.removeItem('company_user');
  }
}
