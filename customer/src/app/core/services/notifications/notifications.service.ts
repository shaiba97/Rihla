import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  bookingAlerts: boolean;
  paymentAlerts: boolean;
  systemAlerts: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  bookingAlerts: true,
  paymentAlerts: true,
  systemAlerts: true,
};

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private auth = inject(AuthStoreService);
  private api = environment.apiUrl.customer;
  private wsUrl = environment.wsUrl;

  private socket: Socket | null = null;
  get connected(): boolean { return this.socket?.connected ?? false; }
  private readonly SETTINGS_KEY = 'rihla_notif_settings';
  private audioUnlocked = false;

  notifications = signal<AppNotification[]>([]);
  settings = signal<NotificationSettings>(this.loadSettings());
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  private audioCtx: AudioContext | null = null;

  constructor() {
    // Expose for console debugging
    if (typeof window !== 'undefined') {
      (window as any).__notifSvc = this;
    }
  }

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  unlockAudio(): void {
    if (this.audioUnlocked) return;
    try {
      const ctx = this.getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      this.audioUnlocked = true;
    } catch {}
  }

  playBookingSound(): void {
    if (!this.settings().soundEnabled) return;
    try {
      const ctx = this.getAudioCtx();
      [440, 550].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.4);
      });
    } catch {}
  }

  playAlertSound(type: 'success' | 'error'): void {
    if (!this.settings().soundEnabled) return;
    try {
      const ctx = this.getAudioCtx();
      const freqs = type === 'success' ? [523, 659, 784] : [300, 250];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type === 'success' ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.35);
      });
    } catch {}
  }

  private loadSettings(): NotificationSettings {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(partial: Partial<NotificationSettings>): void {
    const updated = { ...this.settings(), ...partial };
    this.settings.set(updated);
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
  }

  loadNotifications(): void {
    this.http.get<any>(`${this.api}/notifications?limit=40`).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.notifications.set(data?.notifications ?? data ?? []);
      },
      error: () => {},
    });
  }

  markRead(id: string): void {
    this.http.patch(`${this.api}/notifications/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
      },
      error: () => {},
    });
  }

  markAllRead(): void {
    this.http.patch(`${this.api}/notifications/read-all`, {}).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      },
      error: () => {},
    });
  }

  remove(id: string): void {
    this.http.delete(`${this.api}/notifications/${id}`).subscribe({
      next: () => {
        this.notifications.update(list => list.filter(n => n.id !== id));
      },
      error: () => {},
    });
  }

  clearAll(): void {
    this.http.delete(`${this.api}/notifications/clear-all`).subscribe({
      next: () => this.notifications.set([]),
      error: () => {},
    });
  }

  private addFromWs(n: AppNotification): void {
    this.notifications.update(list => [n, ...list].slice(0, 50));
  }

  connect(): void {
    if (this.socket?.connected) return;

    const user = this.auth.customerData();
    if (!user) return;

    this.socket = io(this.wsUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.socket!.emit('join:room', { room: `customer:${user.id}` });
      if (user.role === 'ADMIN') {
        this.socket!.emit('join:room', { room: 'admin' });
      }
      this.loadNotifications();
    });

    this.socket.on('notification:new', (data: AppNotification) => {
      this.addFromWs(data);
      if (data.type === 'BOOKING_CONFIRMED') {
        this.playAlertSound('success');
      } else if (data.type === 'PAYMENT_REJECTED' || data.type === 'BOOKING_CANCELLED') {
        this.playAlertSound('error');
      } else {
        this.playBookingSound();
      }
      this.showBrowserNotification(data);
    });

    // Unlock audio & request notification permission on first user gesture
    const unlock = () => {
      this.unlockAudio();
      this.requestBrowserPermission();
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
    document.addEventListener('click', unlock, true);
    document.addEventListener('touchstart', unlock, true);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  private showBrowserNotification(n: AppNotification): void {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    new Notification(n.title, { body: n.body, icon: '/customerLogo.png', tag: n.id });
  }

  requestBrowserPermission(): void {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}
