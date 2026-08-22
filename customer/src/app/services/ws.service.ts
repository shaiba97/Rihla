import { Injectable, OnDestroy, signal, inject, effect } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthStoreService } from './auth-store/auth-store.service';

@Injectable({ providedIn: 'root' })
export class WsService implements OnDestroy {
  private socket: Socket | null = null;
  connected = signal(false);
  private handlers = new Map<string, Set<(data: any) => void>>();
  private watchedTrips = new Set<string>();
  private currentIdentity: string | null = null;
  private authStore = inject(AuthStoreService);

  constructor() {
    // React to auth changes: an SPA login must attach the fresh identity,
    // a logout must drop the old room membership. Guests stay connected for
    // public features (live seat maps) — the gateway permits tokenless
    // connections but rejects personal-room joins without a valid JWT.
    effect(() => {
      const identity = this.authStore.customerData()?.id ?? '';
      if (typeof window === 'undefined') return;
      if (identity !== this.currentIdentity) {
        this.reconnectAs(identity);
      }
    });
  }

  private reconnectAs(identity: string): void {
    this.disconnect();
    this.currentIdentity = identity;
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined' || this.socket) return;

    const token = this.authStore.token();
    const customerId = this.authStore.customerData()?.id ?? null;

    this.socket = io(environment.wsUrl || undefined, {
      auth: token ? { token } : {},
      transports: ['polling', 'websocket'],
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      if (customerId) {
        this.socket?.emit('join:room', `customer:${customerId}`);
      }
      // Re-establish public seat watches after any (re)connect.
      this.watchedTrips.forEach((tripId) => {
        this.socket?.emit('watch:seats', tripId);
      });
    });

    this.socket.on('disconnect', () => this.connected.set(false));
    this.socket.on('connect_error', (err) => console.error('[WsService] connect error:', err?.message));

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
    if (!this.watchedTrips.has(tripId)) {
      this.watchedTrips.add(tripId);
      this.socket?.emit('watch:seats', tripId);
    }
  }

  unwatchSeats(tripId: string) {
    if (this.watchedTrips.delete(tripId)) {
      this.socket?.emit('unwatch:seats', tripId);
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
