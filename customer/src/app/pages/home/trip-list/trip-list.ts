import {
  Component, signal, inject, OnInit, computed,
} from '@angular/core';
import { ActivatedRoute, Router }
  from '@angular/router';
// import { NgClass } from '@angular/common';
import {
  LucideLoaderCircle,
  LucideSearchX,
  // LucideSearch,
} from '@lucide/angular';
import { TripCardComponent, Trip }
  from '../../home/trip-card/trip-card';
import { Trips, Trip as TripResp } 
  from '../../../core/services/trips-service/trips';
import { ArabicNumberPipe } from '../../../pipes/arabic-number/arabic-number-pipe';


@Component({
  selector:   'app-trip-list',
  standalone: true,
  imports: [
    // NgClass,
    TripCardComponent,
    LucideLoaderCircle,
    LucideSearchX,
    ArabicNumberPipe,
    // LucideSearch,
  ],
  templateUrl: './trip-list.html',
})
export class TripListComponent implements OnInit {
  private route             = inject(ActivatedRoute);
  private router            = inject(Router);
  private tripsService = inject(Trips);

  trips     = signal<Trip[]>([]);
  isLoading = signal<boolean>(false);
  error     = signal<string>('');

  from = signal<string>('');
  to   = signal<string>('');
  date = signal<string>('');


  ngOnInit(): void {
    this.loadTrips();
  }

  private mapTrip(res: TripResp): Trip {
    return {
      id:          res.id,
      busId:       res.busId,
      fromState:   res.fromState,
      toState:     res.toState,
      fromCity:    res.fromCity,
      fromStation: res.fromStation,
      toCity:      res.toCity,
      toStation:   res.toStation,
      departureDate:  res.departureDate,
      departureTime:  res.departureTime,
      arrivalDate:    res.arrivalDate,
      arrivalTime:    res.arrivalTime,
      price:       res.price,
      status:      res.status,
      bus:         res.Bus ?? {
        id: '',
        name: '',
        chairs: 0,
        seatStartFrom: '',
        plate: {
          arabic: '',
          english: '',
          numbers: '',
        },
      },
      bookings:    res.bookings ?? [],
      createdAt:   res.createdAt,
      updatedAt:   res.updatedAt,
    };
  }

  loadTrips(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.tripsService.getTrips().subscribe({
      next: (res) => {
        
        this.trips.set(res.map(t => this.mapTrip(t)));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message
          ?? 'حدث خطأ أثناء البحث — يرجى المحاولة مجدداً'
        );
        this.isLoading.set(false);
      },
    });
  }

  onTripSelected(trip: Trip): void {
    this.router.navigate(
      ['/booking', trip.id]
    );
  }
}