import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import {
  LucideUsers, LucideBuilding2, LucideTicket, LucideWallet, LucideTrendingUp, LucideClock,
  LucideCheckCircle, LucideBus, LucideAlertCircle, LucideArrowLeft,
  LucideArrowUpRight, LucideActivity,
  LucideBadgeDollarSign, LucideShield, LucideRefreshCw, LucideZap,
} from '@lucide/angular';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { WsService } from '../../core/services/ws.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgClass,
    LucideUsers, LucideBuilding2, LucideTicket, LucideWallet, LucideTrendingUp, LucideClock,
    LucideCheckCircle, LucideBus, LucideAlertCircle, LucideArrowLeft,
    LucideArrowUpRight, LucideActivity,
    LucideBadgeDollarSign, LucideShield, LucideRefreshCw, LucideZap,
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private svc = inject(DashboardService);
  private router = inject(Router);
  private ws = inject(WsService);
  private wsCleanups: (() => void)[] = [];

  data = signal<any>(null);
  isLoading = signal<boolean>(true);
  error = signal<string>('');
  now = new Date();

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  });

  chartAnimated = signal<boolean>(false);

  ngOnInit(): void {
    this.load();
    this.wsCleanups.push(this.ws.on('payment:created', () => this.load()));
    this.wsCleanups.push(this.ws.on('stats:updated', () => this.load()));
    this.wsCleanups.push(this.ws.on('payment:confirmed', () => this.load()));
    this.wsCleanups.push(this.ws.on('payment:rejected', () => this.load()));
  }

  ngOnDestroy() { this.wsCleanups.forEach(fn => fn()); }

  load(): void {
    this.isLoading.set(true); this.error.set('');
    this.svc.getSummary().subscribe({
      next: (res: any) => { this.data.set(res?.data ?? res); this.isLoading.set(false); setTimeout(() => this.chartAnimated.set(true), 200); },
      error: (e: any) => { this.error.set(e?.error?.message ?? 'حدث خطأ أثناء تحميل البيانات'); this.isLoading.set(false); },
    });
  }

  toArabic(n: number | string): string { return String(Math.round(+n || 0)).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  fmtAmount(n: number): string { return String(Math.round(n).toLocaleString('en')).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  fmtDate(d: any): string { if (!d) return '—'; return new Date(d).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }).replace(/[0-9]/g, x => '٠١٢٣٤٥٦٧٨٩'[+x]); }
  fmtTime(d: any): string { if (!d) return ''; return new Date(d).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/[0-9]/g, x => '٠١٢٣٤٥٦٧٨٩'[+x]); }
  barPct(val: number, max: number): number { if (!max) return 0; return Math.round((val / max) * 100); }

  chartMax = computed(() => { const daily = this.data()?.revenue?.dailyRevenue ?? []; if (!daily.length) return 100; return Math.max(...daily.map((d: any) => d.revenue)) || 100; });
  chartData = computed(() => { const daily = this.data()?.revenue?.dailyRevenue ?? []; return daily.slice(-14); });

  confirmRateDash = computed(() => {
    const rate = this.data()?.bookings?.confirmationRate ?? 0;
    const circumference = 2 * Math.PI * 36;
    const filled = (rate / 100) * circumference;
    return `${filled} ${circumference}`;
  });

  statusLabel(s: string): string { const m: Record<string, string> = { PENDING: 'معلق', CONFIRMED: 'مؤكد', CANCELLED: 'ملغى', SUCCESS: 'مدفوع', FAILED: 'مرفوض' }; return m[s] ?? s; }
  statusDot(s: string): string[] { if (s === 'CONFIRMED' || s === 'SUCCESS') return ['bg-[var(--success)]']; if (s === 'CANCELLED' || s === 'FAILED') return ['bg-[var(--danger)]']; return ['bg-[var(--warning)]']; }
  methodLabel(m: string): string { const map: Record<string, string> = { bankak: 'بنكك', fawry: 'فوري', mashriq: 'المشرق', bravo: 'برافو' }; return map[m] ?? m; }
  goTo(path: string): void { this.router.navigate([path]); }
}
