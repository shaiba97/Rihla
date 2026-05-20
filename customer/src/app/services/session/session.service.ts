import { Injectable, signal, computed } from '@angular/core';
import { BookingSession, ContactForm, PassengerForm } from '../../shared/booking-modal/booking-modal/booking.interfaces';

const SESSION_KEY = 'rihla_booking_session';
const TIMEOUT_MS = 7 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class SessionService {
  private _session = signal<BookingSession | null>(null);
  private _remainingMs = signal<number>(TIMEOUT_MS);
  private _timerInterval: ReturnType<typeof setInterval> | null = null;

  session = this._session.asReadonly();
  remainingMs = this._remainingMs.asReadonly();

  remainingFormatted = computed(() => {
    const ms = Math.max(0, Math.ceil(this._remainingMs() / 1000));
    const minutes = Math.floor(ms / 60);
    const seconds = ms % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  isExpired = computed(() => this._remainingMs() <= 0);

  init(tripId: string, ticketId: string, price: number, currency: string): void {
    this._session.set({
      tripId, ticketId,
      selectedSeats: [],
      contactForm: { countryCode: '+249', whatsappNumber: '' },
      passengers: [],
      price, currency,
    });
  }

  startCountdown(): void {
    if (this._timerInterval !== null) return;
    const expiresAt = Date.now() + TIMEOUT_MS;
    const tick = () => {
      const remaining = expiresAt - Date.now();
      this._remainingMs.set(Math.max(0, remaining));
      if (remaining <= 0) this.clear();
    };
    tick();
    this._timerInterval = setInterval(tick, 1000);
  }

  updateSeats(seats: number[]): void {
    const s = this._session();
    if (!s) return;
    if (seats.length > 0 && this._timerInterval === null) {
      this.startCountdown();
    }
    this._session.set({ ...s, selectedSeats: seats });
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
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }
}
