import { Injectable, signal, computed, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BookingSession, ContactForm, PassengerForm } from '../../shared/booking-modal/booking-modal/booking.interfaces';

const SESSION_KEY = 'rihla_booking_session';
const TIMEOUT_MS = 270000; // 4:30

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = environment.apiUrl.customer;

  private _session = signal<BookingSession | null>(null);
  private _remainingMs = signal<number>(TIMEOUT_MS);
  private _timerInterval: ReturnType<typeof setInterval> | null = null;
  private _onExpire: (() => void) | null = null;
  private _tripId = '';
  private _expiresAt = 0;

  session = this._session.asReadonly();
  remainingMs = this._remainingMs.asReadonly();

  remainingFormatted = computed(() => {
    const ms = Math.max(0, Math.ceil(this._remainingMs() / 1000));
    const minutes = Math.floor(ms / 60);
    const seconds = ms % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  isExpired = computed(() => this._remainingMs() <= 0);

  set onExpire(cb: (() => void) | null) {
    this._onExpire = cb;
  }

  init(tripId: string, ticketId: string, price: number, currency: string): void {
    this._tripId = tripId;
    this._session.set({
      tripId, ticketId,
      selectedSeats: [],
      contactForm: { countryCode: '+249', whatsappNumber: '' },
      passengers: [],
      price, currency,
    });
  }

  private startCountdownFrom(expiresAt: number): void {
    this._expiresAt = expiresAt;
    if (this._timerInterval !== null) return;
    const tick = () => {
      const remaining = this._expiresAt - Date.now();
      this._remainingMs.set(Math.max(0, remaining));
      if (remaining <= 0) {
        this.clear();
        this._onExpire?.();
      }
    };
    tick();
    this._timerInterval = setInterval(tick, 1000);
  }

  async lockSeats(tripId: string, seats: number[]): Promise<void> {
    const res = await fetch(`${this.apiUrl}/bookings/lock-seats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeader() },
      body: JSON.stringify({ tripId, seats }),
    });
    if (!res.ok) return;
    const data = await res.json();
    this._tripId = tripId;
    this._expiresAt = data.expiresAt;
    this.startCountdownFrom(data.expiresAt);
    const s = this._session();
    if (s) this._session.set({ ...s, selectedSeats: seats });
    this.persist(tripId, seats);
  }

  async updateSeats(seats: number[]): Promise<void> {
    if (!this._tripId) return;
    if (seats.length === 0) return;
    await this.lockSeats(this._tripId, seats);
  }

  async updateStep(step: 'seat' | 'passenger' | 'payment'): Promise<void> {
    const res = await fetch(`${this.apiUrl}/bookings/session-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeader() },
      body: JSON.stringify({ tripId: this._tripId, step }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.expiresAt) {
      this._expiresAt = data.expiresAt;
      this.startCountdownFrom(data.expiresAt);
    }
    this.persist(this._tripId, this._session()?.selectedSeats ?? []);
  }

  async releaseSeats(): Promise<void> {
    if (!this._tripId) return;
    try {
      await fetch(`${this.apiUrl}/bookings/unlock-seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.authHeader() },
        body: JSON.stringify({ tripId: this._tripId }),
      });
    } catch { /* ignore */ }
    this.clear();
  }

  async restoreFromStorage(): Promise<{ step: string; seats: number[] } | null> {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const { tripId, seats } = JSON.parse(raw);
      if (!tripId) return null;
      this._tripId = tripId;
      const res = await fetch(`${this.apiUrl}/bookings/session-state/${tripId}`, {
        headers: { ...this.authHeader() },
      });
      if (!res.ok) {
        this.clear();
        return null;
      }
      const state = await res.json();
      if (!state) {
        this.clear();
        return null;
      }
      this._expiresAt = state.expiresAt;
      this.startCountdownFrom(state.expiresAt);
      const s = this._session();
      if (s) this._session.set({ ...s, selectedSeats: state.seats ?? [] });
      return { step: state.step ?? 'seat', seats: state.seats ?? [] };
    } catch {
      this.clear();
      return null;
    }
  }

  private persist(tripId: string, seats: number[]): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ tripId, seats }));
    } catch { /* ignore */ }
  }

  private readonly TOKEN_KEY = 'rihla_access_token';

  private authHeader(): Record<string, string> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  }

  updateContact(contact: ContactForm): void {
    const s = this._session();
    if (!s) return;
    this._session.set({ ...s, contactForm: contact });
  }

  updatePassengers(passengers: PassengerForm[]): void {
    const s = this._session();
    if (!s) return;
    this._session.set({ ...s, passengers });
  }

  clear(): void {
    if (this._timerInterval !== null) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
    this._session.set(null);
    this._remainingMs.set(TIMEOUT_MS);
    this._tripId = '';
    this._expiresAt = 0;
    this._onExpire = null;
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }
}
