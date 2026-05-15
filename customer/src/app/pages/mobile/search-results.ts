import { Component, signal, inject, OnInit, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { LucideArrowRight, LucideSearch, LucidePencil, LucideX, LucideLoaderCircle, LucideSearchX, LucideBus, LucideMapPin, LucideArrowUp, LucideArrowDown, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { TripSearchService } from '../../services/trip-search/trip-search.service';
import { MobileTripCardComponent } from '../../shared/mobile-trip-card';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [FormsModule, NgClass, MobileTripCardComponent, ArabicNumberPipe, LucideArrowRight, LucideSearch, LucidePencil, LucideX, LucideLoaderCircle, LucideSearchX, LucideBus, LucideMapPin, LucideArrowUp, LucideArrowDown, LucideChevronLeft, LucideChevronRight],
  templateUrl: './search-results.html',
})
export class SearchResults implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tripSvc = inject(TripSearchService);
  private destroyRef = inject(DestroyRef);

  from = signal<string>('');
  to = signal<string>('');
  date = signal<string>('');
  trips = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  cities = signal<string[]>([]);
  showEdit = signal<boolean>(false);
  editSwapped = signal<boolean>(false);
  editFrom = signal<string>('');
  editTo = signal<string>('');
  editDate = signal<string>('');
  today = new Date().toISOString().split('T')[0];
  editMonth = signal<string>(this.today.slice(0, 7));

  dateLabel = computed(() => {
    if (!this.date()) return '';
    return new Date(this.date()).toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'long' });
  });

  editMonthLabel = computed(() => {
    const [y, m] = this.editMonth().split('-').map(Number);
    return new Date(y, m - 1).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
  });

  editDatePills = computed(() => {
    const [y, m] = this.editMonth().split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const pills = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(y, m - 1, d);
      const value = dateObj.toISOString().split('T')[0];
      pills.push({ value, day: dateObj.toLocaleDateString('ar-SA', { weekday: 'short' }), num: this.toArabicNumeral(d) });
    }
    return pills;
  });

  private toArabicNumeral(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }

  ngOnInit(): void {
    this.tripSvc.getAllCities().subscribe({ next: r => this.cities.set([...new Set(r.data ?? [])]), error: () => {} });
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p => {
      this.from.set(p['from'] ?? ''); this.to.set(p['to'] ?? ''); this.date.set(p['date'] ?? '');
      this.editFrom.set(p['from'] ?? ''); this.editTo.set(p['to'] ?? ''); this.editDate.set(p['date'] ?? '');
      this.loadTrips();
    });
  }

  loadTrips(): void {
    this.isLoading.set(true); this.trips.set([]); this.error.set('');
    this.tripSvc.searchTrips({ from: this.from(), to: this.to(), date: this.date() }).subscribe({
      next: r => { this.trips.set(r.data ?? []); this.isLoading.set(false); },
      error: e => { this.error.set(e?.error?.message ?? 'حدث خطأ أثناء البحث'); this.isLoading.set(false); },
    });
  }

  openEdit(): void { this.editFrom.set(this.from()); this.editTo.set(this.to()); this.editDate.set(this.date()); this.editMonth.set(this.date().slice(0, 7) || this.today.slice(0, 7)); this.showEdit.set(true); }
  closeEdit(): void { this.showEdit.set(false); }
  swapEdit(): void { const t = this.editFrom(); this.editFrom.set(this.editTo()); this.editTo.set(t); this.editSwapped.set(!this.editSwapped()); }
  prevEditMonth(): void { const [y, m] = this.editMonth().split('-').map(Number); const d = new Date(y, m - 2, 1); this.editMonth.set(d.toISOString().split('T')[0].slice(0, 7)); }
  nextEditMonth(): void { const [y, m] = this.editMonth().split('-').map(Number); const d = new Date(y, m, 1); this.editMonth.set(d.toISOString().split('T')[0].slice(0, 7)); }
  applyEdit(): void { if (!this.editFrom() || !this.editTo() || !this.editDate()) return; this.showEdit.set(false); this.router.navigate(['/m/results'], { queryParams: { from: this.editFrom(), to: this.editTo(), date: this.editDate() } }); }
  goBack(): void { this.router.navigate(['/m']); }
  onTripSelected(trip: any): void { this.router.navigate(['/m/seat', trip.id], { state: { trip } }); }
}
