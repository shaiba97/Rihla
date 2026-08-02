import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private readonly document = inject(DOCUMENT);

  /**
   * Injects (or replaces) a JSON-LD `<script>` tag identified by `id`.
   * One canonical script per id; re-injecting with the same id replaces it.
   */
  set(id: string, graph: object | object[]): void {
    const content = JSON.stringify(graph, (_key, value) => (value === undefined ? undefined : value));
    const existing = this.document.head.querySelector<HTMLScriptElement>(
      `script[data-jsonld-id="${id}"]`,
    );
    if (existing) {
      existing.textContent = content;
      return;
    }
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-jsonld-id', id);
    script.textContent = content;
    this.document.head.appendChild(script);
  }

  /** Removes a previously injected JSON-LD `<script>` tag identified by `id`. */
  remove(id: string): void {
    const existing = this.document.head.querySelector<HTMLScriptElement>(
      `script[data-jsonld-id="${id}"]`,
    );
    if (existing) existing.parentNode?.removeChild(existing);
  }
}
