import {
  Component, signal, inject, OnInit, computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideBus,
  LucideArrowLeftRight,
  LucideCalendar,
  LucideSearch,
  LucideMapPin,
  LucideLoaderCircle,
} from '@lucide/angular';
import { Trips, TripSearchParams } from '../../../core/services/trips-service/trips';
import { Assets } from '../../../core/services/assets-service/assets';

interface DatePill {
  label: string;
  date: string;
}

@Component({
  selector:   'app-search-hero',
  standalone: true,
  imports: [
    FormsModule,
    LucideBus,
    LucideArrowLeftRight,
    LucideCalendar,
    LucideSearch,
    LucideMapPin,
    LucideLoaderCircle,
  ],
  templateUrl: './search-hero.html',
})
export class SearchHeroComponent implements OnInit {
  private tripsService = inject(Trips);
  private router            = inject(Router);
  private assetsService = inject(Assets);

  from      = signal<string>('');
  to        = signal<string>('');
  date      = signal<string>('');
  isLoading = signal<boolean>(false);
  error     = signal<string>('');
  cities    = signal<string[]>([]);

  today = new Date().toISOString().split('T')[0];

  datePills = computed((): DatePill[] => {
    const d = new Date();
    const fmt = (offset: number): string => {
      const dt = new Date(d);
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString().split('T')[0];
    };
    const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return [
      { label: 'اليوم', date: fmt(0) },
      { label: 'غداً', date: fmt(1) },
      { label: weekdays[new Date(fmt(2)).getDay()], date: fmt(2) },
    ];
  });

  popularRoutes = [
    { from: 'الخرطوم', to: 'بورتسودان' },
    { from: 'الخرطوم', to: 'كسلا'      },
    { from: 'الخرطوم', to: 'عطبرة'     },
    { from: 'أم درمان', to: 'الخرائط'  },
  ];

  ngOnInit(): void {
    this.assetsService.getAllCities().forEach(city => {
      this.cities.update(cities => [...cities, city.city]);
    });
  }

  selectDatePill(pill: DatePill): void {
    this.date.set(pill.date);
  }

  swap(): void {
    const temp = this.from();
    this.from.set(this.to());
    this.to.set(temp);
  }

  selectRoute(from: string, to: string): void {
    this.from.set(from);
    this.to.set(to);
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
      this.date.set(this.today);
    }else if (this.date() < this.today) {
      this.error.set(
        'تاريخ السفر يجب أن يكون بعد تاريخ اليوم'
      );
      return;
    }
    this.error.set('');
    this.router.navigate(['/search-results'], {
      queryParams: {
        from: this.from(),
        to:   this.to(),
        date: this.date(),
      }
    });
  }
}