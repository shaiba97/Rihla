import { Component, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ticket-preview',
  imports: [LucideX],
  template: `
    @if (visible()) {
      <div 
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="عرض التذكرة"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="close()"></div>

        <!-- Sheet -->
        <div
          class="relative w-full sm:max-w-lg max-h-[90vh] bg-[var(--bg-card)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
          (click)="$event.stopPropagation()"
        >
          <!-- Handle bar (mobile) -->
          <div class="flex sm:hidden items-center justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-[var(--border)]"></div>
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 class="text-base font-bold text-[var(--text-primary)]">عرض التذكرة</h2>
            <button
              (click)="close()"
              class="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-all duration-150"
              aria-label="إغلاق"
            >
              <svg lucideX class="w-5 h-5"></svg>
            </button>
          </div>

          <!-- PDF viewer -->
          <div class="flex-1 overflow-auto bg-[var(--bg-base)] min-h-[50vh]">
            @if (ticketUrl()) {
              <embed
                [src]="pdfUrl()"
                type="application/pdf"
                class="w-full h-[70vh] sm:h-[65vh]"
              />
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
  ticketUrl = input<string>('');
  visible = input<boolean>(false);
  closed = output<void>();

  pdfUrl(): string {
    const url = this.ticketUrl();
    return url ? environment.fileUrl + url : '';
  }

  close(): void {
    this.closed.emit();
  }
}
