import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LucideCalendarClock, LucideBus, LucideLoaderCircle, LucideLogIn, LucideArrowLeft, LucideDownload, LucideEye } from '@lucide/angular';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';
import { TimeFormatPipe } from '../../pipes/time-format/time-format-pipe';
import { BookingService } from '../../services/booking/booking.service';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';
import { WsService } from '../../services/ws.service';
import { NgClass, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { TicketPreviewComponent } from '../../shared/ticket-preview/ticket-preview';

@Component({
  selector: 'app-bookings',
  imports: [LucideCalendarClock, LucideBus, LucideLoaderCircle, LucideLogIn, LucideArrowLeft, LucideDownload, LucideEye, ArabicNumberPipe, TimeFormatPipe, NgClass, DatePipe, TicketPreviewComponent],
  templateUrl: './bookings.html',
})
export class BookingsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private bookingSvc = inject(BookingService);
  private ws = inject(WsService);
  authStore = inject(AuthStoreService);

  bookings = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  selectedBooking = signal<any | null>(null);
  supportContacts = signal<any[]>([]);
  private wsCleanups: (() => void)[] = [];

  ngOnInit(): void {
    if (this.authStore.isLoggedIn()) {
      this.loadBookings();
    }
    this.loadSupportContacts();

    this.wsCleanups.push(this.ws.on('booking:created', () => this.silentRefresh()));
    this.wsCleanups.push(this.ws.on('booking:cancelled', () => this.silentRefresh()));
    this.wsCleanups.push(this.ws.on('payment:confirmed', () => this.silentRefresh()));
    this.wsCleanups.push(this.ws.on('payment:rejected', () => this.silentRefresh()));
  }

  ngOnDestroy(): void {
    this.wsCleanups.forEach(fn => fn());
  }

  private silentRefresh(): void {
    const customerId = this.authStore.customerData()?.id;
    if (!customerId) return;
    this.bookingSvc.getMyBookings('customerId', customerId).subscribe({
      next: r => this.bookings.set(r.data ?? []),
      error: () => {},
    });
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

  private loadSupportContacts(): void {
    this.bookingSvc.getSupportContacts().subscribe({
      next: r => this.supportContacts.set(r ?? []),
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
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

  async downloadTicket(e: Event, booking: any): Promise<void> {
    e.stopPropagation();
    if (!booking?.id) return;

    const token = this.authStore.token();
    window.open(
      environment.fileUrl + '/api-customer/tickets/pdf/' + booking.id + '?token=' + token,
      '_blank',
    );
  }

  showTicketView(e: Event, booking: any): void {
    e.stopPropagation();
    if (!booking?.id) return;
    this.selectedBooking.set(booking);
  }

  closeTicketView(): void {
    this.selectedBooking.set(null);
  }

  bookingTime(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

}
