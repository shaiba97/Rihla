import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideBus, LucideMapPin, LucideClock, LucideCalendar, LucideArrowRight } from '@lucide/angular';

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
  imports: [CommonModule, RouterModule, LucideBus, LucideMapPin, LucideClock, LucideCalendar, LucideArrowRight],
  templateUrl: './bus-details.html',
  styleUrl: './bus-details.css',
})
export class BusDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
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

  private getBusByProperty(property: string, value: string) {
    return this.http.get<Bus>(
      `${this.apiUrl}/buses/get-bus/property/${property}/value/${value}`
    );
  }

  private getTripsByBusId(busId: string) {
    return this.http.get<Trip[]>(
      `${this.apiUrl}/buses/get-trips/property/busId/value/${busId}`
    );
  }

  loadBus(id: string) {
    this.getBusByProperty('id', id).subscribe({
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
    this.getTripsByBusId(id).subscribe({
      next: (trips: Trip[]) => {
        this.trips.set(trips);
      },
      error: () => {},
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString;
  }

  get seatDirection(): string {
    return this.bus()?.seatStartFrom === 'RIGHT' ? 'يمين' : 'يسار';
  }
}