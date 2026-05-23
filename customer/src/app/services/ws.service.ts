import { Injectable, OnDestroy, signal, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthStoreService } from './auth-store/auth-store.service';

@Injectable({ providedIn: 'root' })
export class WsService implements OnDestroy {
  private socket: Socket | null = null;
  connected = signal(false);
  private handlers = new Map<string, Set<(data: any) => void>>();
  private authStore = inject(AuthStoreService);

  constructor() {
    if (this.authStore.isLoggedIn()) {
      this.connect();
    }
  }

  private connect() {
    const token = this.authStore.token();
    const customerId = this.authStore.customerData()?.id;
    if (!token || !customerId || this.socket) return;

    this.socket = io(environment.wsUrl || undefined, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      this.socket?.emit('join:room', `customer:${customerId}`);
    });

    this.socket.on('disconnect', () => this.connected.set(false));
    this.socket.on('connect_error', (err) => console.error('[WsService] connect error:', err.message));

    this.socket.onAny((event: string, data: any) => {
      this.handlers.get(event)?.forEach((h) => h(data));
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
  }

  on<T = any>(event: string, handler: (data: T) => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  watchSeats(tripId: string) {
    this.socket?.emit('watch:seats', tripId);
  }

  unwatchSeats(tripId: string) {
    this.socket?.emit('unwatch:seats', tripId);
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
