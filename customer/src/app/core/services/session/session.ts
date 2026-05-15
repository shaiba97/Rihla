import {
  Injectable, signal, computed, OnDestroy,
} from '@angular/core';
import {
  BookingSessionState,
  ContactForm,
  PassengerForm,
} from '../../../services/booking/booking.interfaces';

const SESSION_KEY = 'rihla_booking_session';
const TIMEOUT_MS  = 7 * 60 * 1000; // 7 minutes

@Injectable({ providedIn: 'root' })
export class SessionService implements OnDestroy {

  private _session =
    signal<BookingSessionState | null>(null);

  private _remainingMs = signal<number>(TIMEOUT_MS);
  private _timerInterval: ReturnType<typeof setInterval> | null = null;

  private _onExpire: (() => void) | null = null;

  session        = this._session.asReadonly();
  remainingMs    = this._remainingMs.asReadonly();

  remainingFormatted = computed(() => {
    const ms      = this._remainingMs();
    const total   = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  isExpired = computed(() =>
    this._remainingMs() <= 0
  );

  isActive = computed(() =>
    this._session() !== null && !this.isExpired()
  );

  constructor() {
    this.restoreFromStorage();
  }

  init(
    tripId:   string,
    ticketId: string,
    price:    number,
    currency: string,
  ): void {
    const existing = this._session();
    if (existing && existing.tripId === tripId && !this.isExpired()) {
      this.startTimer(existing.expiresAt);
      return;
    }

    const now       = Date.now();
    const expiresAt = now + TIMEOUT_MS;

    const state: BookingSessionState = {
      tripId,
      ticketId,
      price,
      currency,
      selectedSeats:   [],
      step:            'seat',
      startedAt:       now,
      expiresAt,
      savedContact:    null,
      savedPassengers: [],
    };

    this._session.set(state);
    this.saveToStorage(state);
  }

  startCountdown(): void {
    const s = this._session();
    if (!s) return;
    if (this._timerInterval !== null) return;
    this.startTimer(s.expiresAt);
  }

  private startTimer(expiresAt: number): void {
    if (this._timerInterval !== null) {
      clearInterval(this._timerInterval);
    }

    const tick = () => {
      const remaining = expiresAt - Date.now();
      this._remainingMs.set(Math.max(0, remaining));

      if (remaining <= 0) {
        this.onSessionExpired();
      }
    };

    tick();
    this._timerInterval = setInterval(tick, 1000);
  }

  private onSessionExpired(): void {
    this.stopTimer();
    this.clear();
    if (this._onExpire) {
      this._onExpire();
    }
  }

  private stopTimer(): void {
    if (this._timerInterval !== null) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  onExpire(callback: () => void): void {
    this._onExpire = callback;
  }

  updateSeats(seats: number[]): void {
    const s = this._session();
    if (!s) return;

    if (seats.length > 0 && this._timerInterval === null) {
      this.startCountdown();
    }

    const updated = { ...s, selectedSeats: seats };
    this._session.set(updated);
    this.saveToStorage(updated);
  }

  updateStep(step: 'seat' | 'passenger' | 'payment'): void {
    const s = this._session();
    if (!s) return;
    const updated = { ...s, step };
    this._session.set(updated);
    this.saveToStorage(updated);
  }

  updateContact(contact: ContactForm): void {
    const s = this._session();
    if (!s) return;
    const updated = { ...s, savedContact: contact };
    this._session.set(updated);
    this.saveToStorage(updated);
  }

  updatePassengers(passengers: PassengerForm[]): void {
    const s = this._session();
    if (!s) return;
    const updated = { ...s, savedPassengers: passengers };
    this._session.set(updated);
    this.saveToStorage(updated);
  }

  getSavedContact(): ContactForm | null {
    return this._session()?.savedContact ?? null;
  }

  getSavedPassengers(): PassengerForm[] {
    return this._session()?.savedPassengers ?? [];
  }

  getSelectedSeats(): number[] {
    return this._session()?.selectedSeats ?? [];
  }

  getCurrentStep(): 'seat' | 'passenger' | 'payment' {
    return this._session()?.step ?? 'seat';
  }

  hasActiveSession(tripId: string): boolean {
    const s = this._session();
    return !!s && s.tripId === tripId && !this.isExpired();
  }

  clear(): void {
    this.stopTimer();
    this._session.set(null);
    this._remainingMs.set(TIMEOUT_MS);
    this._onExpire = null;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch { /* ignore */ }
  }

  private saveToStorage(state: BookingSessionState): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }

  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;

      const state: BookingSessionState = JSON.parse(raw);

      if (Date.now() >= state.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }

      this._session.set(state);
      const remaining = state.expiresAt - Date.now();
      this._remainingMs.set(Math.max(0, remaining));

      if (state.selectedSeats.length > 0) {
        this.startTimer(state.expiresAt);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
