import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface AdminUser {
  id: string; name: string; email?: string | null; phone?: string | null; role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AdminUser;
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
  data?: AdminUser;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: AdminUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl.admin;

  private _user = signal<AdminUser | null>(null);
  private _token = signal<string | null>(null);

  isLoggedIn = computed(() => !!this._token() && !!this._user());
  currentUser = this._user.asReadonly();

  constructor() {
    if (typeof window !== 'undefined') {
      this._token.set(localStorage.getItem('admin_token'));
      try { const raw = localStorage.getItem('admin_user'); if (raw) this._user.set(JSON.parse(raw)); }
      catch {}
    }
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    const body = identifier.includes('@') ? { email: identifier, password } : { phone: identifier, password };
    return this.http.post<LoginResponse>(`${this.api}/users/post-login`, body);
  }

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.api}/users/post-user`, payload);
  }

  setSession(token: string, user: AdminUser): void {
    localStorage.setItem('admin_token', token); this._token.set(token);
    localStorage.setItem('admin_user', JSON.stringify(user)); this._user.set(user);
  }

  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.api}/users/me`);
  }

  logout(): void {
    const token = this._token();
    if (token) {
      this.http.post<LogoutResponse>(`${this.api}/users/logout`, {}).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
    localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user');
    this._token.set(null); this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null { return this._token(); }

  get userId(): string | null { return this._user()?.id ?? null; }
  get userEmail(): string { return this._user()?.email ?? ''; }
  get userPhone(): string { return this._user()?.phone ?? ''; }

  updateProfile(data: { name?: string; email?: string; phone?: string }): Observable<UpdateProfileResponse> {
    const id = this._user()?.id;
    if (!id) throw new Error('Not authenticated');
    return this.http.put<UpdateProfileResponse>(`${this.api}/users/update-user/${id}`, data);
  }

  updateLocalProfile(data: { name?: string; email?: string; phone?: string }): void {
    const current = this._user();
    if (!current) return;
    const updated = { ...current, ...data };
    this._user.set(updated);
    localStorage.setItem('admin_user', JSON.stringify(updated));
  }

  deleteAccount(): Observable<DeleteAccountResponse> {
    const id = this._user()?.id;
    if (!id) throw new Error('Not authenticated');
    return this.http.delete<DeleteAccountResponse>(`${this.api}/users/delete-user/${id}`);
  }
}
