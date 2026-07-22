import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideBus, LucideMapPin, LucideClock, LucideCalendar, LucideArrowRight } from '@lucide/angular';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';
import { formatArabicDate, formatArabicTime } from '../../pipes/arabic-number/arabic-number.util';
import { BusService } from '../../core/services/bus';
import { TripService } from '../../core/services/trip';

interface Bus {
  id: string;
  name: string;
  chairs: number;
  seatStartFrom: 'LEFT' | 'RIGHT';
  plate: {
    arabic: string;
    english: string;
    numbers: string;
  };
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

interface Trip {
  id: string;
  busId: string;
  fromCity: string;
  fromStation: string;
  toCity: string;
  toStation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
  availableChairs: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-bus-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideBus, LucideMapPin, LucideClock, LucideCalendar, LucideArrowRight, ArabicNumberPipe],
  templateUrl: './bus-details.html',
  styleUrl: './bus-details.css',
})
export class BusDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private busService = inject(BusService)
  private tripService = inject(TripService)
  private apiUrl = 'http://localhost:3001/api';


  busId = signal<string>('');
  bus = signal<Bus | null>(null);
  trips = signal<Trip[]>([]);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.busId.set(id);
      this.loadBus(id);
      this.loadTrips(id);
    }
  }

  loadBus(id: string) {
    this.busService.getBusByProperty('id', id).subscribe({
      next: (bus: Bus) => {
        this.bus.set(bus);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadTrips(id: string) {
    this.tripService.getTripByProperty('busId', id).subscribe({
      next: (trip: Trip) => {
        this.trips.set([trip]);
      },
      error: () => {},
    });
  }

  formatDate(dateString: string): string {
    return formatArabicDate(dateString);
  }

  formatTime(timeString: string): string {
    return formatArabicTime(timeString);
  }

  get seatDirection(): string {
    return this.bus()?.seatStartFrom === 'RIGHT' ? 'يمين' : 'يسار';
  }

  tripStatusLabel(status: string): string {
    return { SCHEDULED: 'مجدولة', IN_PROGRESS: 'جارية', COMPLETED: 'مكتملة', CANCELLED: 'ملغاة' }[status] ?? status;
  }

  tripStatusColor(status: string): string {
    return { SCHEDULED: 'var(--primary)', IN_PROGRESS: '#f59e0b', COMPLETED: '#22c55e', CANCELLED: '#ef4444' }[status] ?? 'var(--text-muted)';
  }
}