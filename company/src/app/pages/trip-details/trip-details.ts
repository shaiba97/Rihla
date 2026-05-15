import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService, Trip, Booking } from '../../core/services/trip';
import { BusService, Bus } from '../../core/services/bus';
import { LucideBus, LucideArrowRight, LucideRoute, LucideArrowLeft } from '@lucide/angular';

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideBus, LucideArrowRight, LucideRoute, LucideArrowLeft],
  templateUrl: './trip-details.html',
  styleUrl: './trip-details.css',
})
export class TripDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tripService = inject(TripService);
  private busService = inject(BusService);

  trip = signal<Trip | null>(null);
  bus = signal<Bus | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTrip(id);
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
}