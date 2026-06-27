import { Component, signal, computed, inject, OnInit, ElementRef, AfterViewInit, OnDestroy, ViewChild, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { LucideBus, LucideMapPin, LucideSearch, LucidePencil, LucideX, LucideArrowUp, LucideArrowDown, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { TripSearchService } from '../../services/trip-search/trip-search.service';
import { MobileTripCardComponent } from '../../shared/mobile-trip-card';
import { CitiesService } from '../../services/cities/cities.service';
import { CitySelectComponent } from '../../shared/city-select/city-select';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-home',

  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgClass, LucideBus, LucideMapPin, LucideSearch, LucidePencil, LucideX, LucideArrowUp, LucideArrowDown, LucideChevronLeft, LucideChevronRight, MobileTripCardComponent, CitySelectComponent],
  templateUrl: './home.html',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tripSvc = inject(TripSearchService);
  private citiesSvc = inject(CitiesService);
  private hostElement = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);
  authStore = inject(AuthStoreService);

  @ViewChild('mainSearchCard') mainSearchCard!: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;



  from = signal<string>('');
  to = signal<string>('');
  date = signal<string>('');
  cities = signal<string[]>([]);
  today = new Date().toISOString().split('T')[0];
  error = signal<string>('');
  featuredTrips = signal<any[]>([]);
  isLoadingTrips = signal<boolean>(false);

  currentMonth = signal<string>(this.today.slice(0, 7));
  scrollY = signal<number>(0);
  showSearchModal = signal<boolean>(false);

  scrollProgress = computed(() => Math.min(1, this.scrollY() / 600));
  heroOpacity = computed(() => Math.max(0, 1 - this.scrollProgress() * 2));
  showCompactSearchBar = signal(false);
  userName = computed(() => this.authStore.customerName() || 'مستخدم رحلة');
  compactSearchRouteLabel = computed(() => {
    const f = this.from();
    const t = this.to();
    if (f && t) return `${f} ← ${t}`;
    return 'إلى أين تريد السفر؟';
  });
  compactSearchDateLabel = computed(() => {
    const d = this.date();
    if (!d) return 'اختر التاريخ';
    return new Date(d).toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' });
  });
  swapped = signal<boolean>(false);

  routeLabel = computed(() => {
    const f = this.from();
    const t = this.to();
    if (f && t) return `${f} ← ${t}`;
    if (f) return f;
    return 'ابحث عن رحلة';
  });

  monthLabel = computed(() => {
    const [y, m] = this.currentMonth().split('-').map(Number);
    return new Date(y, m - 1).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
  });

  datePills = computed(() => {
    const [y, m] = this.currentMonth().split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const pills = [];
    const todayStr = this.today;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(y, m - 1, d);
      const value = dateObj.toISOString().split('T')[0];
      if (value < todayStr) continue;
      pills.push({ value, day: dateObj.toLocaleDateString('ar-SA', { weekday: 'short' }), num: this.toArabicNumeral(d), isToday: value === this.today });
    }
    return pills;
  });

  canGoPrev = computed(() => this.currentMonth() > this.today.slice(0, 7));
  selectedDate = computed(() => this.date() || this.today);

  private toArabicNumeral(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }

  ngOnInit(): void {
    this.citiesSvc.getAllCities().subscribe({
      next: data => this.cities.set(data),
    });
    this.isLoadingTrips.set(true);
    this.tripSvc.getAllTrips().subscribe({
      next: r => { this.featuredTrips.set(r.data ?? []); this.isLoadingTrips.set(false); },
      error: () => this.isLoadingTrips.set(false),
    });
    this.date.set(this.today);
  }

  ngAfterViewInit(): void {
    const el = this.hostElement.nativeElement.closest('.overflow-y-auto') as HTMLElement | null;
    if (el) {
      const handler = () => this.scrollY.set(el.scrollTop);
      el.addEventListener('scroll', handler, { passive: true });
      this.destroyRef.onDestroy(() => el.removeEventListener('scroll', handler));
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.showCompactSearchBar.set(
          !entry.isIntersecting &&
          (entry.boundingClientRect.top < 0)
        );
      },
      { threshold: 0 }
    );
    if (this.mainSearchCard) {
      this.observer.observe(this.mainSearchCard.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  swap(): void { const t = this.from(); this.from.set(this.to()); this.to.set(t); this.swapped.set(!this.swapped()); }
  selectDate(val: string): void { this.date.set(val); }
  prevMonth(): void {
    const [y, m] = this.currentMonth().split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    this.currentMonth.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  nextMonth(): void {
    const [y, m] = this.currentMonth().split('-').map(Number);
    const d = new Date(y, m, 1);
    this.currentMonth.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  goToSeat(trip: any): void { if (trip?.id) this.router.navigate(['../seat', trip.id], { relativeTo: this.route, state: { trip } }); }

  onSearch(): void {
    if (!this.from() || !this.to() || !this.date()) { this.error.set('يرجى تعبئة جميع الحقول'); return; }
    this.error.set('');
    this.router.navigate(['/search-results'], { queryParams: { from: this.from(), to: this.to(), date: this.date() } });
  }

  openSearchModal(): void { this.showSearchModal.set(true); }
  closeSearchModal(): void { this.showSearchModal.set(false); }

  onSearchFromModal(): void {
    this.closeSearchModal();
    setTimeout(() => this.onSearch(), 150);
  }
}
