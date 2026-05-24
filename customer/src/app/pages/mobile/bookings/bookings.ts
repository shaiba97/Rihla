import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideCalendarClock, LucideBus, LucideLoaderCircle, LucideLogIn, LucideArrowLeft, LucideDownload, LucideEye, LucideX } from '@lucide/angular';
import { ArabicNumberPipe } from '../../../pipes/arabic-number/arabic-number-pipe';
import { TimeFormatPipe } from '../../../pipes/time-format/time-format-pipe';
import { BookingService } from '../../../services/booking/booking.service';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';
import { WsService } from '../../../services/ws.service';
import { NgClass, DatePipe } from '@angular/common';

@Component({
  selector: 'app-bookings',
  imports: [LucideCalendarClock, LucideBus, LucideLoaderCircle, LucideLogIn, LucideArrowLeft, LucideDownload, LucideEye, LucideX, ArabicNumberPipe, TimeFormatPipe, NgClass, DatePipe],
  templateUrl: './bookings.html',
})
export class Bookings implements OnInit, OnDestroy {
  private router = inject(Router);
  private bookingSvc = inject(BookingService);
  private sanitizer = inject(DomSanitizer);
  private ws = inject(WsService);
  authStore = inject(AuthStoreService);

  bookings = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  showTicketModal = signal<boolean>(false);
  activeTicketUrl = signal<string>('');
  private wsCleanups: (() => void)[] = [];

  ngOnInit(): void {
    
    if (this.authStore.isLoggedIn()) {
      this.loadBookings();
    }

    this.wsCleanups.push(this.ws.on('booking:created', () => this.loadBookings()));
    this.wsCleanups.push(this.ws.on('booking:cancelled', () => this.loadBookings()));
    this.wsCleanups.push(this.ws.on('payment:confirmed', () => this.loadBookings()));
    this.wsCleanups.push(this.ws.on('payment:rejected', () => this.loadBookings()));
  }

  ngOnDestroy(): void {
    this.wsCleanups.forEach(fn => fn());
  }

  loadBookings(): void {
    const customerId = this.authStore.customerData()?.id;
    if (!customerId) return;
    this.isLoading.set(true);
    this.error.set('');
    this.bookingSvc.getMyBookings('customerId', customerId).subscribe({
      next: r => { this.bookings.set(r.data ?? []); this.isLoading.set(false); },
      error: () => { this.error.set('حدث خطأ أثناء تحميل الحجوزات'); this.isLoading.set(false); },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/m/login']);
  }

  goHome(): void {
    this.router.navigate(['/m/home']);
  }

  statusClass(status: string): Record<string, boolean> {
    const s = status?.toLowerCase();
    return {
      'bg-emerald-100 text-emerald-700': s === 'confirmed' || s === 'completed' || s === 'success',
      'bg-amber-100 text-amber-700': s === 'pending',
      'bg-red-100 text-red-700': s === 'cancelled' || s === 'failed' || s === 'refunded',
    };
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'مؤكد', pending: 'قيد الانتظار', cancelled: 'ملغي',
      completed: 'مكتمل', success: 'مدفوع', failed: 'مرفوض', refunded: 'مسترد',
    };
    return map[status?.toLowerCase()] ?? status;
  }

  downloadTicket(e: Event, url: string): void {
    e.stopPropagation();
    if (!url) return;
    window.location.href = `http://${window.location.hostname}:3002${url}`;
  }

  viewTicket(e: Event, url: string): void {
    e.stopPropagation();
    if (!url) return;
    this.activeTicketUrl.set(`http://${window.location.hostname}:3002${url}`);
    this.showTicketModal.set(true);
  }

  closeTicketModal(): void {
    this.showTicketModal.set(false);
    this.activeTicketUrl.set('');
  }

  safeTicketUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.activeTicketUrl());
  }
}
