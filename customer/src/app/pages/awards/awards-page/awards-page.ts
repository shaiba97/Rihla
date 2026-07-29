import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AwardsService, AwardPack } from '../../../core/services/awards/awards.service';

@Component({
  selector: 'app-awards-page',
  imports: [],
  templateUrl: './awards-page.html',
})
export class AwardsPage implements OnInit {
  private router = inject(Router);
  private awardsSvc = inject(AwardsService);

  packs = signal<AwardPack[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.awardsSvc.getPacks().subscribe({
      next: (p) => { this.packs.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  back() {
    const segments = this.router.url.split('/');
    const prefix = segments[0] === 'm' ? '/m/profile' : '/profile';
    this.router.navigate([prefix]);
  }

  toArabic(n: number | string): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  formatAmount(n: number | string): string { return this.toArabic(Math.round(Number(n)).toLocaleString('en')); }
}
