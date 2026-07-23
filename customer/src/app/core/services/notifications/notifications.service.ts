import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
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
  private readonly SETTINGS_KEY = 'tafiya_notif_settings';

  notifications = signal<AppNotification[]>([]);
  settings = signal<NotificationSettings>(this.loadSettings());
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).__notifSvc = this;
    }
  }

  async init(): Promise<void> {
    await this.fetch();
    this.requestLocalPermission();
    this.connect();
    this.startPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => this.fetch(), 15000);
  }

  stopPolling(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;
  }

  async fetch(): Promise<void> {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.api}/notifications?limit=40`),
      );
      const data = res?.data ?? res;
      this.notifications.set(data?.notifications ?? data ?? []);
    } catch {}
  }

  private isNative = Capacitor.isNativePlatform();

  private async showLocalNotification(n: AppNotification): Promise<void> {
    if (!this.isNative || !this.settings().soundEnabled) return;
    try {
      const id = Array.from(n.id).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100000;
      await LocalNotifications.schedule({
        notifications: [{
          id,
          title: n.title,
          body: n.body,
          sound: 'default',
          channelId: 'tafiya_notifications',
        }],
      });
    } catch {}
  }

  private showBrowserNotification(n: AppNotification): void {
    if (this.isNative) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    new Notification(n.title, { body: n.body, icon: '/customerLogo.png?v=4', tag: n.id });
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

  async markRead(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.patch(`${this.api}/notifications/${id}/read`, {}));
      this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  }

  async markAllRead(): Promise<void> {
    try {
      await firstValueFrom(this.http.patch(`${this.api}/notifications/read-all`, {}));
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    } catch {}
  }

  async remove(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.api}/notifications/${id}`));
      this.notifications.update(list => list.filter(n => n.id !== id));
    } catch {}
  }

  async clearAll(): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.api}/notifications/clear-all`));
      this.notifications.set([]);
    } catch {}
  }

  private addFromWs(n: AppNotification): void {
    this.notifications.update(list => [n, ...list].slice(0, 50));
  }

  connect(): void {
    if (this.socket?.connected) return;

    const user = this.auth.customerData();
    if (!user) return;

    this.socket = io(this.wsUrl, {
      transports: ['polling', 'websocket'],
    });

    this.socket.on('connect', () => {
      this.socket!.emit('join:room', { room: `customer:${user.id}` });
      if (user.role === 'ADMIN') {
        this.socket!.emit('join:room', { room: 'admin' });
      }
      this.fetch();
    });

    this.socket.on('notification:new', (data: AppNotification) => {
      this.addFromWs(data);
      this.showLocalNotification(data);
      this.showBrowserNotification(data);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  requestBrowserPermission(): void {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  async requestLocalPermission(): Promise<void> {
    if (!this.isNative) return;
    try {
      await LocalNotifications.requestPermissions();
      await LocalNotifications.createChannel({
        id: 'tafiya_notifications',
        name: 'إشعارات تفية',
        sound: 'default',
        importance: 4,
        vibration: true,
      });
    } catch {}
  }
}
