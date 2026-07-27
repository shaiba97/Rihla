import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AwardsService, PackDetailResponse } from '../../../core/services/awards/awards.service';

@Component({
  selector: 'app-pack-detail',
  imports: [],
  templateUrl: './pack-detail.html',
})
export class PackDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(AwardsService);

  data = signal<PackDetailResponse | null>(null);
  loading = signal(true);
  requesting = signal(false);
  error = signal('');

  packDetail = computed(() => this.data()?.pack);
  awards = computed(() => this.data()?.awards ?? []);
  totalBookings = computed(() => this.data()?.totalBookings ?? 0);

  ngOnInit() {
    const packId = this.route.snapshot.paramMap.get('packId');
    if (!packId) { this.router.navigate(['/profile']); return; }
    this.svc.getPackDetail(packId).subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('فشل تحميل التفاصيل'); },
    });
  }

  requestAward() {
    const packId = this.packDetail()?.id;
    if (!packId) return;
    this.requesting.set(true);
    this.error.set('');
    this.svc.requestAward(packId).subscribe({
      next: () => {
        this.requesting.set(false);
        this.svc.getPackDetail(packId).subscribe(res => this.data.set(res));
      },
      error: (e) => {
        this.requesting.set(false);
        this.error.set(e?.error?.message ?? 'حدث خطأ');
      },
    });
  }

  goBack() { this.router.navigate(['/profile']); }

  toArabic(n: number | string): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  formatAmount(n: number | string): string { return this.toArabic(Math.round(Number(n)).toLocaleString('en')); }
  fmtDate(d: any): string { if (!d) return '—'; return this.toArabic(new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })); }
  statusLabel(s: string): string { return { PENDING: 'قيد الانتظار', APPROVED: 'مقبولة', REJECTED: 'مرفوضة' }[s] ?? s; }
}
