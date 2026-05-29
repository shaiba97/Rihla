import { Component, signal, computed, inject, OnInit, ElementRef, AfterViewInit, DestroyRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';
import { LucideBus, LucideMapPin, LucideSearch, LucidePencil, LucideX, LucideArrowUp, LucideArrowDown, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { TripSearchService } from '../../services/trip-search/trip-search.service';
import { MobileTripCardComponent } from '../../shared/mobile-trip-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe, LucideBus, LucideMapPin, LucideSearch, LucidePencil, LucideX, LucideArrowUp, LucideArrowDown, LucideChevronLeft, LucideChevronRight, MobileTripCardComponent],
  templateUrl: './home.html',
})
export class Home implements OnInit, AfterViewInit {
  private router = inject(Router);
  private tripSvc = inject(TripSearchService);
  private hostElement = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);
  private zone = inject(NgZone);

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

  protected readonly Math = Math;

  scrollProgress = computed(() => Math.min(1, this.scrollY() / 200));
  toggleBarOpacity = computed(() => this.scrollProgress());
  heroOpacity = computed(() => 1 - this.scrollProgress());
  heroHeight = computed(() => Math.max(0, 280 * (1 - this.scrollProgress())));
  heroOverlap = computed(() => this.heroHeight() * 0.25);
  searchCardProgress = computed(() => this.scrollProgress());
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
    this.tripSvc.getAllCities().subscribe({ next: r => this.cities.set([...new Set(r.data ?? [])]), error: () => {} });
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
      const handler = () => this.zone.run(() => this.scrollY.set(el.scrollTop));
      el.addEventListener('scroll', handler, { passive: true });
      this.destroyRef.onDestroy(() => el.removeEventListener('scroll', handler));
    }
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

  goToSeat(trip: any): void { if (trip?.id) this.router.navigate(['/m/seat', trip.id], { state: { trip } }); }

  onSearch(): void {
    if (!this.from() || !this.to() || !this.date()) { this.error.set('يرجى تعبئة جميع الحقول'); return; }
    this.error.set('');
    this.router.navigate(['/m/results'], { queryParams: { from: this.from(), to: this.to(), date: this.date() } });
  }

  openSearchModal(): void { this.showSearchModal.set(true); }
  closeSearchModal(): void { this.showSearchModal.set(false); }

  onSearchFromModal(): void {
    this.closeSearchModal();
    setTimeout(() => this.onSearch(), 150);
  }
}
