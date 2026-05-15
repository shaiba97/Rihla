import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly TIMEOUT_MS = 7 * 60 * 1000;
  private timerId: ReturnType<typeof setInterval> | null = null;

  readonly expiryTime = signal<number | null>(null);
  readonly remainingMs = signal<number>(7 * 60 * 1000);
  readonly selectedSeats = signal<number[]>([]);

  readonly remainingFormatted = computed(() => {
    const ms = this.remainingMs();
    if (ms <= 0) return '00:00';
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  readonly isExpired = computed(() => this.remainingMs() <= 0);

  startCountdown(): void {
    this.stopTimer();
    const expiry = Date.now() + this.TIMEOUT_MS;
    this.expiryTime.set(expiry);
    this.remainingMs.set(this.TIMEOUT_MS);
    this.timerId = setInterval(() => {
      const left = Math.max(0, expiry - Date.now());
      this.remainingMs.set(left);
      if (left <= 0) this.stopTimer();
    }, 1000);
  }

  updateSeats(seats: number[]): void {
    this.selectedSeats.set(seats);
  }

  clear(): void {
    this.stopTimer();
    this.expiryTime.set(null);
    this.remainingMs.set(this.TIMEOUT_MS);
    this.selectedSeats.set([]);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
