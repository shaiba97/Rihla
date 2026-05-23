import { Component, signal, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { FinancialsService, FinancialSummary } from '../../../core/services/financials/financials.service';
import { TripService, Trip } from '../../../core/services/trip';
import { BusService, Bus } from '../../../core/services/bus';
import { ArabicNumberPipe } from '../../../pipes/arabic-number/arabic-number-pipe';
import { LucideTrendingUp, LucideWallet, LucideTicket, LucideBus, LucideRoute, LucideLoaderCircle, LucideAlertCircle, LucideRefreshCw, LucideCalendar, LucideArrowLeft, LucideBarChart3, LucideUsers } from '@lucide/angular';
import { WsService } from '../../../core/services/ws.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, ArabicNumberPipe, LucideTrendingUp, LucideWallet, LucideTicket, LucideBus, LucideRoute, LucideLoaderCircle, LucideAlertCircle, LucideRefreshCw, LucideCalendar, LucideArrowLeft, LucideBarChart3, LucideUsers],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private financialsSvc = inject(FinancialsService);
  private tripSvc = inject(TripService);
  private busSvc = inject(BusService);
  private router = inject(Router);
  private ws = inject(WsService);
  private wsCleanups: (() => void)[] = [];

  companyName = this.auth.companyName;

  summary = signal<FinancialSummary | null>(null);
  trips = signal<Trip[]>([]);
  buses = signal<Bus[]>([]);
  isLoading = signal(true);
  error = signal('');

  stats = computed(() => {
    const s = this.summary();
    if (!s) return [];
    const activeTrips = this.trips().filter(t => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED').length;
    const totalBuses = this.buses().length;
    return [
      { label: 'إجمالي الإيرادات', value: s.totalRevenue, currency: 'جنيه', icon: 'trending-up', color: 'emerald', sub: 'كامل المبالغ المحصلة' },
      { label: 'إيرادات الشهر', value: s.thisMonthRevenue, currency: 'جنيه', icon: 'calendar', color: 'blue', sub: 'الشهر الجاري' },
      { label: 'حجوزات مؤكدة', value: s.totalBookings, currency: '', icon: 'ticket', color: 'violet', sub: 'إجمالي المقاعد المباعة' },
      { label: 'الرحلات النشطة', value: activeTrips, currency: '', icon: 'route', color: 'orange', sub: `من أصل ${totalBuses} حافلة` },
    ];
  });

  upcomingTrips = computed(() =>
    this.trips()
      .filter(t => t.status === 'SCHEDULED' || t.status === 'IN_PROGRESS')
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())
      .slice(0, 5)
  );

  recentTrips = computed(() =>
    this.trips()
      .filter(t => t.status === 'COMPLETED')
      .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime())
      .slice(0, 5)
  );

  ngOnInit() {
    this.load();
    this.wsCleanups.push(this.ws.on('booking:created', () => this.load()));
    this.wsCleanups.push(this.ws.on('trip:status-changed', () => this.load()));
  }

  ngOnDestroy() { this.wsCleanups.forEach(fn => fn()); }

  load() {
    this.isLoading.set(true);
    this.error.set('');
    this.financialsSvc.getSummary().subscribe({
      next: r => this.summary.set(r.data),
      error: e => this.error.set(e?.error?.message ?? 'حدث خطأ'),
    });
    this.tripSvc.getTrips().subscribe({
      next: r => this.trips.set(r),
      error: () => {},
    });
    this.busSvc.getBuses().subscribe({
      next: r => { this.buses.set(r); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); },
    });
  }

  getStatusLabel(s: string): string {
    return { SCHEDULED: 'مجدولة', IN_PROGRESS: 'جارية', COMPLETED: 'مكتملة', CANCELLED: 'ملغاة' }[s] || s;
  }

  getStatusColor(s: string): string {
    return { SCHEDULED: 'var(--primary)', IN_PROGRESS: '#f59e0b', COMPLETED: '#22c55e', CANCELLED: '#ef4444' }[s] || 'var(--text-muted)';
  }

  goToTrip(id: string) { this.router.navigate(['trips/trip/trip-details', id]); }
  goToTrips() { this.router.navigate(['/trips']); }
  goToFinancials() { this.router.navigate(['/financials']); }

  methodLabel(m: string): string {
    return { bankak: 'بنكك', fawry: 'فوري', mashriq: 'المشرق', bravo: 'برافو' }[m] ?? m;
  }
  toArabic(n: number | string): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  fmt(n: number): string { return this.toArabic(n.toLocaleString('en')); }
  fmtDate(d: string): string { return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }); }
}
