import { Injectable, inject, OnDestroy } from '@angular/core';
import { WsService } from './ws.service';

interface EntityEvent {
  domain: string;
  action: 'created' | 'updated' | 'deleted';
  entityId: string;
}

@Injectable({ providedIn: 'root' })
export class SocketReactivityService implements OnDestroy {
  private readonly ws = inject(WsService);
  private cleanup: (() => void) | null = null;

  init(): void {
    this.cleanup = this.ws.on<EntityEvent>('entity:change', (event) =>
      window.dispatchEvent(new CustomEvent('entity:change', { detail: event })),
    );
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
