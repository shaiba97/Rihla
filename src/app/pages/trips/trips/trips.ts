import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService, Trip } from '../../../core/services/trip';
import { BusService, Bus } from '../../../core/services/bus';
import { ArabicNumberPipe } from '../../../pipes/arabic-number/arabic-number-pipe';
import { LucideBus, LucidePencil, LucideTrash2, LucideX, LucideArrowLeft, LucideRoute } from '@lucide/angular';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ArabicNumberPipe, LucideBus, LucidePencil, LucideTrash2, LucideX, LucideArrowLeft, LucideRoute],
  templateUrl: './trips.html',
  styleUrl: './trips.css',
})
export class TripsComponent implements OnInit {
  private tripService = inject(TripService);
  private busService = inject(BusService);
  private router = inject(Router);

  trips = signal<Trip[]>([]);
  buses = signal<Bus[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  showUpdateModal = signal(false);
  tripToDelete = signal<string | null>(null);
  tripToUpdate = signal<Trip | null>(null);
  submitting = signal(false);

  states = [
    'الخرطوم', 'الجزيرة', 'البحر الأحمر', 'كسلا', 'القضارف',
    'سنار', 'النيل الأبيض', 'النيل الأزرق', 'الشمالية', 'نهر النيل',
    'شمال كردفان', 'غرب كردفان', 'جنوب كردفان', 'شمال دارفور',
    'غرب دارفور', 'جنوب دارفور', 'شرق دارفور', 'وسط دارفور'
  ];

  statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  fromState = signal('');
  toState = signal('');
  fromCity = signal('');
  toCity = signal('');
  fromStation = signal('');
  toStation = signal('');
  departureDate = signal('');
  departureTime = signal('');
  arrivalDate = signal('');
  arrivalTime = signal('');
  price = signal<number>(0);
  status = signal('SCHEDULED');
  busId = signal('');

  formErrors = signal<Record<string, string>>({});

  ngOnInit() {
    this.loadTrips();
    this.loadBuses();
  }

  getTrips(): void {
    this.loading.set(true);
    (this.tripService.getTrips() as unknown as { subscribe: (handlers: { next: (data: Trip[]) => void; error?: (err: unknown) => void }) => void }).subscribe({
      next: (data: Trip[]) => {
        this.trips.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadTrips() { this.getTrips(); }

  loadBuses() {
    this.busService.getBuses().subscribe({
      next: (buses: Bus[]) => this.buses.set(buses),
      error: () => {},
    });
  }

  openCreateModal() {
    this.tripToUpdate.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openUpdateModal(trip: Trip) {
    this.tripToUpdate.set(trip);
    this.fromState.set(trip.fromState || '');
    this.toState.set(trip.toState || '');
    this.fromCity.set(trip.fromCity);
    this.toCity.set(trip.toCity);
    this.fromStation.set(trip.fromStation);
    this.toStation.set(trip.toStation);
    this.departureDate.set(trip.departureDate);
    this.departureTime.set(trip.departureTime);
    this.arrivalDate.set(trip.arrivalDate);
    this.arrivalTime.set(trip.arrivalTime);
    this.price.set(trip.price);
    this.status.set(trip.status);
    this.busId.set(trip.busId);
    this.formErrors.set({});
    this.showModal.set(true);
    this.showUpdateModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.showUpdateModal.set(false);
    this.formErrors.set({});
  }

  resetForm() {
    this.fromState.set('');
    this.toState.set('');
    this.fromCity.set('');
    this.toCity.set('');
    this.fromStation.set('');
    this.toStation.set('');
    this.departureDate.set('');
    this.departureTime.set('');
    this.arrivalDate.set('');
    this.arrivalTime.set('');
    this.price.set(0);
    this.status.set('SCHEDULED');
    this.busId.set('');
    this.formErrors.set({});
  }

  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const d = {
      fromState: this.fromState(), toState: this.toState(),
      fromCity: this.fromCity(), toCity: this.toCity(),
      fromStation: this.fromStation(), toStation: this.toStation(),
      departureDate: this.departureDate(), departureTime: this.departureTime(),
      arrivalDate: this.arrivalDate(), arrivalTime: this.arrivalTime(),
      price: this.price(), status: this.status(), busId: this.busId(),
    };

    if (!d.fromState) errors['fromState'] = 'اختر ولاية البداية';
    if (!d.toState) errors['toState'] = 'اختر ولاية النهاية';
    if (!d.fromCity) errors['fromCity'] = 'أدخل مدينة البداية';
    if (!d.toCity) errors['toCity'] = 'أدخل مدينة النهاية';
    if (!d.fromStation) errors['fromStation'] = 'أدخل محطة البداية';
    if (!d.toStation) errors['toStation'] = 'أدخل محطة النهاية';
    if (!d.departureDate) errors['departureDate'] = 'أدخل تاريخ المغادرة';
    if (!d.departureTime) errors['departureTime'] = 'أدخل وقت المغادرة';
    if (!d.arrivalDate) errors['arrivalDate'] = 'أدخل تاريخ الوصول';
    if (!d.arrivalTime) errors['arrivalTime'] = 'أدخل وقت الوصول';
    if (!d.price || d.price <= 0) errors['price'] = 'أدخل سعر صحيح';
    if (!d.status || !this.statuses.includes(d.status)) errors['status'] = 'اختر حالة صحيحة';
    if (!d.busId) errors['busId'] = 'اختر حافلة';
    if (d.fromState && d.toState && d.fromState === d.toState) errors['toState'] = 'ولاية البداية والنهاية يجب أن تختلفا';
    if (d.fromCity && d.toCity && d.fromCity === d.toCity) errors['toCity'] = 'مدينة البداية والنهاية يجب أن تختلفان';

    if (d.departureDate) {
      const dep = new Date(d.departureDate);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (dep < today) errors['departureDate'] = 'تاريخ المغادرة يجب أن يكون في المستقبل';
    }
    if (d.departureDate && d.arrivalDate) {
      if (new Date(d.arrivalDate) < new Date(d.departureDate)) errors['arrivalDate'] = 'تاريخ الوصول يجب أن يكون بعد تاريخ المغادرة';
    }
    if (d.departureDate === d.arrivalDate && d.departureTime && d.arrivalTime) {
      if (d.departureTime >= d.arrivalTime) errors['arrivalTime'] = 'وقت الوصول يجب أن يكون بعد وقت المغادرة';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  submitForm() {
    if (!this.validateForm()) return;
    this.submitting.set(true);

    const fmt = (t: string) => t.includes(':') && t.split(':').length === 2 ? t + ':00' : t;
    const data = {
      fromState: this.fromState(), toState: this.toState(),
      fromCity: this.fromCity(), toCity: this.toCity(),
      fromStation: this.fromStation(), toStation: this.toStation(),
      departureDate: new Date(this.departureDate()), departureTime: fmt(this.departureTime()),
      arrivalDate: new Date(this.arrivalDate()), arrivalTime: fmt(this.arrivalTime()),
      price: this.price(), status: this.status(), busId: this.busId(),
    };
    

    const req = this.tripToUpdate()
      ? this.tripService.updateTrip(this.tripToUpdate()!.id, data)
      : this.tripService.createTrip(data);

    req.subscribe({
      next: () => { this.getTrips(); this.closeModal(); this.submitting.set(false); },
      error: (err: unknown) => {
        this.submitting.set(false);
        const errors: Record<string, string> = {};
        if (err && typeof err === 'object' && 'error' in err) {
          const e = err as { error?: { message?: string } };
          if (e.error?.message) errors['general'] = e.error.message;
        }
        if (!errors['general']) errors['general'] = 'حدث خطأ أثناء حفظ الرحلة';
        this.formErrors.set(errors);
      },
    });
  }

  confirmDelete(id: string) { this.tripToDelete.set(id); this.showDeleteConfirm.set(true); }
  cancelDelete() { this.tripToDelete.set(null); this.showDeleteConfirm.set(false); }

  deleteTrip() {
    const id = this.tripToDelete();
    if (!id) return;
    this.tripService.deleteTrip(id).subscribe({
      next: () => { this.getTrips(); this.cancelDelete(); },
      error: () => this.cancelDelete(),
    });
  }

  goToTripDetails(id: string) { this.router.navigate(['trips/trip/trip-details', id]); }

  getStatusLabel(s: string): string {
    return { 'SCHEDULED': 'مجدولة', 'IN_PROGRESS': 'جارية', 'COMPLETED': 'مكتملة', 'CANCELLED': 'ملغاة' }[s] || s;
  }

  getStatusColor(s: string): string {
    return { 'SCHEDULED': 'var(--primary)', 'IN_PROGRESS': '#f59e0b', 'COMPLETED': '#22c55e', 'CANCELLED': '#ef4444' }[s] || 'var(--text-muted)';
  }
}