import {
  Component, signal, inject,
  OnInit, computed,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { NgClass } from '@angular/common';
import {
  LucideBus,
  LucideArrowLeftRight,
  LucideCalendar,
  LucideSearch,
  LucideLoaderCircle,
  LucideSearchX,
  LucideArrowUpDown,
  LucideChevronDown,
  LucideX,
  LucideMapPin,
  LucideClock,
} from '@lucide/angular';
import {
  TripCardComponent,
  Trip,
} from '../home/trip-card/trip-card';
import { Trips, Trip as TripResp } 
  from '../../core/services/trips-service/trips';
import { Assets } from '../../core/services/assets-service/assets';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';

type SortOption = 'price-asc' | 'price-desc'
                | 'time-asc'  | 'time-desc';

@Component({
  selector:    'app-search-results',
  standalone: true,
  imports: [
    FormsModule,
    // NgClass,
    TripCardComponent,
    ArabicNumberPipe,
    LucideBus,
    LucideArrowLeftRight,
    LucideCalendar,
    LucideSearch,
    LucideLoaderCircle,
    LucideSearchX,
    LucideArrowUpDown,
    LucideChevronDown,
    LucideX,
    LucideMapPin,
    LucideClock,
  ],
  templateUrl: './search-results.html',
})
export class SearchResultsComponent implements OnInit {
  private route             = inject(ActivatedRoute);
  private router            = inject(Router);
  private tripsService = inject(Trips);
  private assetService = inject(Assets)

  from = signal<string>('');
  to   = signal<string>('');
  date = signal<string>('');

  allTrips  = signal<Trip[]>([]);
  isLoading = signal<boolean>(false);
  error     = signal<string>('');
  cities    = signal<[]>([]);

  sortBy = signal<SortOption>('time-asc');

  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'time-asc',   label: 'الأقرب انطلاقاً' },
    { value: 'time-desc',  label: 'الأبعد انطلاقاً' },
    { value: 'price-asc',  label: 'الأقل سعراً'     },
    { value: 'price-desc', label: 'الأعلى سعراً'    },
  ];

  today = new Date().toISOString().split('T')[0];

  sortedTrips = computed(() => {
    const trips = [...this.allTrips()];
    const sort  = this.sortBy();
    return trips.sort((a, b) => {
      if (sort === 'price-asc')
        return a.price - b.price;
      if (sort === 'price-desc')
        return b.price - a.price;
      if (sort === 'time-asc')
        return new Date(a.departureTime).getTime()
             - new Date(b.departureTime).getTime();
      if (sort === 'time-desc')
        return new Date(b.departureTime).getTime()
             - new Date(a.departureTime).getTime();
      return 0;
    });
  });

  resultCount = computed(() =>
    this.sortedTrips().length
  );

  searchLabel = computed(() =>
    this.from() && this.to()
      ? `${this.from()} ← ${this.to()}`
      : 'نتائج البحث'
  );

  dateLabel = computed(() => {
    if (!this.date()) return '';
    const d = new Date(this.date());
    return d.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
    });
  });

  hasResults = computed(() =>
    !this.isLoading() &&
    !this.error() &&
    this.sortedTrips().length > 0
  );

  isEmpty = computed(() =>
    !this.isLoading() &&
    !this.error() &&
    this.sortedTrips().length === 0
  );

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

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.from.set(params['from'] ?? '');
      this.to.set(params['to']     ?? '');
      this.date.set(params['date'] ?? '');
      if (this.from() && this.to() && this.date()) {
        this.loadTrips();
      }
    });

  }

  loadTrips(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.allTrips.set([]);

    this.tripsService.searchTrips({
      fromCity: this.from(),
      toCity:   this.to(),
      departureDate: this.date(),
    }).subscribe({
      next: (res) => {
        this.allTrips.set((res.data ?? []).map(t => this.mapTrip(t)));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(
          'حدث خطأ أثناء البحث. يرجى المحاولة مجدداً'
        );
        this.isLoading.set(false);
      },
    });
  }

  swap(): void {
    const temp = this.from();
    this.from.set(this.to());
    this.to.set(temp);
  }

  onSearch(): void {
        if (!this.from() && !this.to() && !this.date()) {
      this.error.set(
        'يرجى تعبئة جميع الحقول للبحث عن رحلة'
      );
      return;
    }else if (!this.from()) {
      this.error.set(
        'يرجى اختيار مدينة المغادرة'
      );
      return;
    }else if (!this.to()) {
      this.error.set(
        'يرجى اختيار مدينة الوصول'
      );
      return;
    }else if (this.from() === this.to()) {
      this.error.set(
        'المدينة المغادرة والوصول يجب أن تكون مختلفة'
      );
      return;
    }else if (!this.date()) {
      this.error.set(
        'يرجى اختيار تاريخ السفر'
      );
      return;
    }else if (this.date() < this.today) {
      this.error.set(
        'تاريخ السفر يجب أن يكون بعد تاريخ اليوم'
      );
      return;
    }
    this.router.navigate(['/search-results'], {
      queryParams: {
        from: this.from(),
        to:   this.to(),
        date: this.date(),
      },
    });
  }

  onTripSelected(trip: Trip): void {
    this.router.navigate(['/booking', trip.id]);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

}