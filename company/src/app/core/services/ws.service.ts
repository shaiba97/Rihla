import { Injectable, OnDestroy, signal, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class WsService implements OnDestroy {
  private socket: Socket | null = null;
  connected = signal(false);
  private handlers = new Map<string, Set<(data: any) => void>>();
  private auth = inject(AuthService);

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.connect();
    }
    const origLogout = this.auth.logout.bind(this.auth);
    const self = this;
    this.auth.logout = () => {
      self.disconnect();
      return origLogout();
    };
  }

  private connect() {
    const token = this.auth.token();
    const user = this.auth.currentUser();
    if (!token || !user || this.socket) return;

    this.socket = io(environment.wsUrl || undefined, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      this.socket?.emit('join:room', `company:${user.id}`);
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

  ngOnDestroy() {
    this.disconnect();
  }
}
