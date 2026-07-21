import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { ChartComponent } from 'ng-apexcharts';
import { LucideTrendingUp, LucideWallet, LucideBanknote, LucideTicket, LucideClock, LucideMapPin, LucideLoaderCircle, LucideAlertCircle, LucideRefreshCw, LucideCalendar, LucideBarChart3 } from '@lucide/angular';
import { FinancialsService, FinancialSummary } from '../../../core/services/financials/financials.service';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ApexDataLabels, ApexFill } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  colors: string[];
};

@Component({
  selector: 'app-financials',
  standalone: true,
  imports: [NgClass, ChartComponent, LucideTrendingUp, LucideWallet, LucideTicket, LucideClock, LucideMapPin, LucideLoaderCircle, LucideAlertCircle, LucideRefreshCw, LucideCalendar, LucideBarChart3],
  templateUrl: './financials.html',
})
export class FinancialsComponent implements OnInit {
  private svc = inject(FinancialsService);
  summary = signal<FinancialSummary | null>(null);
  isLoading = signal(true);
  error = signal('');

  perfPeriod = signal<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'>('monthly');
  perfData = signal<any[]>([]);
  perfPeriods = [
    { id: 'daily' as const, label: 'يومي' },
    { id: 'weekly' as const, label: 'أسبوعي' },
    { id: 'monthly' as const, label: 'شهري' },
    { id: 'quarterly' as const, label: 'ربعي' },
    { id: 'half-yearly' as const, label: 'نصف سنوي' },
    { id: 'yearly' as const, label: 'سنوي' },
  ];

  chartOptions = computed<ChartOptions>(() => {
    const daily = this.summary()?.dailyRevenue ?? [];
    return {
      series: [{ name: 'الإيرادات', data: daily.map(d => d.amount) }],
      chart: { type: 'bar', height: 200, toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
      colors: ['#10b981'],
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
      grid: { borderColor: 'var(--border)', strokeDashArray: 4, yaxis: { lines: { show: true } } },
      xaxis: { categories: daily.map(d => { const dt = new Date(d.date); return dt.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }); }), labels: { style: { colors: 'var(--text-muted)', fontSize: '10px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { colors: 'var(--text-muted)', fontSize: '10px' } }, show: daily.length > 0 },
      tooltip: { theme: 'dark', style: { fontSize: '12px', fontFamily: 'inherit' } },
    };
  });

  cards = computed(() => {
    const s = this.summary(); if (!s) return [];
    return [
      { label: 'إجمالي الإيرادات', value: s.totalRevenue, currency: 'جنيه', icon: 'trending-up', color: 'emerald', sub: 'كامل المبالغ المحصلة' },
      { label: 'إيرادات الشهر', value: s.thisMonthRevenue, currency: 'جنيه', icon: 'calendar', color: 'blue', sub: 'الشهر الجاري' },
      { label: 'حجوزات مؤكدة', value: s.totalBookings, currency: '', icon: 'ticket', color: 'violet', sub: 'إجمالي المقاعد المباعة' },
      { label: 'متوسط التذكرة', value: s.totalBookings > 0 ? Math.round(s.totalRevenue / s.totalBookings) : 0, currency: 'جنيه', icon: 'banknote', color: 'amber', sub: 'متوسط سعر المقعد الواحد' },
    ];
  });

  methodLabel(m: string): string {
    return { bankak: 'بنكك', fawry: 'فوري', mashriq: 'المشرق', bravo: 'برافو' }[m] ?? m;
  }

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true); this.error.set('');
    this.svc.getSummary().subscribe({
      next: r => { this.summary.set(r.data); this.isLoading.set(false); },
      error: e => { this.error.set(e?.error?.message ?? 'حدث خطأ'); this.isLoading.set(false); },
    });
    this.loadPerformance();
  }

  loadPerformance() {
    this.svc.getPerformance(this.perfPeriod()).subscribe({
      next: r => this.perfData.set(r.data ?? []),
      error: () => {},
    });
  }

  setPerfPeriod(p: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly') {
    this.perfPeriod.set(p);
    this.loadPerformance();
  }

  toArabic(n: number | string): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  fmt(n: number): string { return this.toArabic(n.toLocaleString('en')); }
  fmtDate(d: string): string { return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }); }
}
