import { Component, input, output, inject, signal, effect } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideX, LucidePrinter } from '@lucide/angular';
import { environment } from '../../../environments/environment';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-ticket-preview',
  imports: [LucideX, LucidePrinter],
  template: `
    @if (visible()) {
      <div 
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="عرض التذكرة"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="close()"></div>

        <div
          class="relative w-full sm:max-w-3xl max-h-[90vh] bg-[var(--bg-card)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
          (click)="$event.stopPropagation()"
        >
          <div class="flex sm:hidden items-center justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-[var(--border)]"></div>
          </div>

          <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 class="text-base font-bold text-[var(--text-primary)]">عرض التذكرة</h2>
            <div class="flex items-center gap-2">
              <button
                (click)="print()"
                class="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-all duration-150"
                aria-label="طباعة"
              >
                <svg lucidePrinter class="w-5 h-5"></svg>
              </button>
              <button
                (click)="close()"
                class="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-all duration-150"
                aria-label="إغلاق"
              >
                <svg lucideX class="w-5 h-5"></svg>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-auto bg-[var(--bg-base)] min-h-[50vh]">
            @if (safeUrl()) {
              <iframe
                [src]="safeUrl()"
                class="w-full h-[80vh] sm:h-[75vh]"
                style="border: none;"
                title="عرض التذكرة"
              ></iframe>
            } @else {
              <div class="flex items-center justify-center h-[50vh] text-sm text-[var(--text-muted)]">
                لا توجد تذكرة متاحة
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      .animate-slide-up {
        animation: slideUp 0.3s ease-out;
      }
    `,
  ],
})
export class TicketPreviewComponent {
  bookingId = input<string>('');
  visible = input<boolean>(false);
  closed = output<void>();

  private sanitizer = inject(DomSanitizer);
  private authStore = inject(AuthStoreService);

  safeUrl = signal<SafeResourceUrl>('');

  constructor() {
    effect(() => {
      const id = this.bookingId();
      if (!id) {
        this.safeUrl.set('');
        return;
      }
      const token = this.authStore.token();
      if (!token) {
        this.safeUrl.set('');
        return;
      }
      this.safeUrl.set(
        this.sanitizer.bypassSecurityTrustResourceUrl(
          environment.fileUrl + '/api-customer/tickets/html/' + id + '?token=' + token,
        ),
      );
    });
  }

  close(): void {
    this.closed.emit();
  }

  print(): void {
    const iframe = document.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  }
}
