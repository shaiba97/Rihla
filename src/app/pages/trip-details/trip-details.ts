import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService, Trip, Booking } from '../../core/services/trip';
import { BusService, Bus } from '../../core/services/bus';
import { AuthService } from '../../core/services/auth';
import { LucideBus, LucideArrowRight, LucideRoute, LucideArrowLeft, LucideDownload, LucideEye, LucideX, LucideTrash2, LucideUserPlus } from '@lucide/angular';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';
import { WsService } from '../../core/services/ws.service'

@Component({
  selector: 'app-trip-details',
  imports: [CommonModule, RouterModule, FormsModule, LucideBus, LucideArrowRight, LucideRoute, LucideArrowLeft, LucideDownload, LucideEye, LucideX, LucideTrash2, LucideUserPlus, ArabicNumberPipe],
  templateUrl: './trip-details.html',
  styleUrl: './trip-details.css',
})
export class TripDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tripService = inject(TripService);
  private busService = inject(BusService);
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private ws = inject(WsService);

  private wsCleanups: (() => void)[] = [];

  trip = signal<Trip | null>(null);
  bus = signal<Bus | null>(null);
  loading = signal(true);
  showTicketModal = signal(false);
  ticketModalUrl = signal('');
  ticketModalTitle = signal('');

  showBookingModal = signal(false);
  bookingSubmitting = signal(false);
  bookingError = signal('');
  passengerName = signal('');
  passengerAge = signal<number | null>(null);
  passengerGender = signal('MALE');
  seatNumbersInput = signal('');

  confirmedBookings = computed(() => this.trip()?.Booking?.filter(b => b.status === 'CONFIRMED') || []);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTrip(id);

    this.wsCleanups.push(this.ws.on('seat:updated', (data: any) => {
      if (id && data.tripId === id) this.loadTrip(id);
    }));
  }

  loadTrip(id: string) {
    this.tripService.getTripByProperty('id', id).subscribe({
      next: (trip: Trip) => {
        this.trip.set(trip);
        if (trip.busId) this.loadBus(trip.busId);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadBus(busId: string) {
    this.busService.getBusByProperty('id', busId).subscribe({
      next: (bus: Bus) => this.bus.set(bus),
      error: () => {},
    });
  }

  goBack() {
    this.router.navigate(['/trips']);
  }

  getStatusLabel(s: string): string {
    return { 'SCHEDULED': 'مجدولة', 'IN_PROGRESS': 'جارية', 'COMPLETED': 'مكتملة', 'CANCELLED': 'ملغاة' }[s] || s;
  }

  getStatusColor(s: string): string {
    return { 'SCHEDULED': 'var(--primary)', 'IN_PROGRESS': '#f59e0b', 'COMPLETED': '#22c55e', 'CANCELLED': '#ef4444' }[s] || 'var(--text-muted)';
  }

  getBookingStatusLabel(s: string): string {
    return { 'CONFIRMED': 'مؤكد', 'PENDING': 'قيد الانتظار', 'CANCELLED': 'ملغى' }[s] || s;
  }

  getBookingStatusColor(s: string): string {
    return { 'CONFIRMED': '#22c55e', 'PENDING': '#f59e0b', 'CANCELLED': '#ef4444' }[s] || 'var(--text-muted)';
  }

  genderLabel(g: string): string {
    return g === 'MALE' ? 'ذكر' : g === 'FEMALE' ? 'أنثى' : g;
  }

  isStationary(booking: any): boolean {
    return booking.passengerContact === 'STATIONARY';
  }

  downloadTicket(url: string | undefined): void {
    if (url) window.open(url, '_blank');
  }

  viewTicket(url: string | undefined): void {
    if (url) { this.ticketModalUrl.set(url); this.ticketModalTitle.set('التذكرة'); this.showTicketModal.set(true); }
  }

  closeTicketModal(): void { this.showTicketModal.set(false); this.ticketModalUrl.set(''); this.ticketModalTitle.set(''); }
  safeUrl(url: string) { return this.sanitizer.bypassSecurityTrustResourceUrl(url); }

  downloadPassengers(tripId: string): void {
    const url = this.tripService.downloadPassengers(tripId);
    window.open(url, '_blank');
  }

  viewPassengers(tripId: string): void {
    const trip = this.trip();
    if (!trip) return;
    this.tripService.generatePassengersPdf(trip, this.confirmedBookings()).subscribe({
      next: (res) => {
        this.ticketModalUrl.set(res.url);
        this.ticketModalTitle.set('كشف الركاب');
        this.showTicketModal.set(true);
      },
      error: () => alert('تعذر تحميل كشف الركاب'),
    });
  }

  openBookingModal() {
    this.passengerName.set('');
    this.passengerAge.set(null);
    this.passengerGender.set('MALE');
    this.seatNumbersInput.set('');
    this.bookingError.set('');
    this.showBookingModal.set(true);
  }

  closeBookingModal() {
    this.showBookingModal.set(false);
    this.bookingError.set('');
  }

  submitBooking() {
    const trip = this.trip();
    if (!trip) return;

    const name = this.passengerName().trim();
    const age = this.passengerAge();
    const gender = this.passengerGender();
    const seats = this.seatNumbersInput().split(',').map(s => parseInt(s.trim(), 10)).filter(s => !isNaN(s));

    if (!name) { this.bookingError.set('الرجاء إدخال اسم الراكب'); return; }
    if (!age || age < 1) { this.bookingError.set('الرجاء إدخال عمر الراكب'); return; }
    if (seats.length === 0) { this.bookingError.set('الرجاء إدخال رقم المقعد'); return; }

    this.bookingSubmitting.set(true);
    this.bookingError.set('');
    const user = this.auth.currentUser();
    const customerId = user?.id || '';

    this.tripService.createBooking(trip.id, {
      seatNumbers: seats,
      passenger: [{ name, age, gender }],
      customerId,
    }).subscribe({
      next: () => {
        this.bookingSubmitting.set(false);
        this.closeBookingModal();
        this.loadTrip(trip.id);
      },
      error: (err) => {
        this.bookingSubmitting.set(false);
        this.bookingError.set(err?.error?.message || err?.message || 'حدث خطأ أثناء إنشاء الحجز');
      },
    });
  }

  cancelStationaryBooking(bookingId: string) {
    if (!confirm('هل أنت متأكد من إلغاء هذا الحجز المكتبي؟')) return;
    this.tripService.cancelBooking(bookingId).subscribe({
      next: () => {
        const id = this.trip()?.id;
        if (id) this.loadTrip(id);
      },
      error: () => alert('حدث خطأ أثناء إلغاء الحجز'),
    });
  }

  ngOnDestroy() { this.wsCleanups.forEach(fn => fn()); }
}
