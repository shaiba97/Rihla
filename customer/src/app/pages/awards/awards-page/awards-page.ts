import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AwardsService, AwardPack, Earnings } from '../../../core/services/awards/awards.service';

@Component({
  selector: 'app-awards-page',
  imports: [FormsModule],
  templateUrl: './awards-page.html',
})
export class AwardsPage implements OnInit {
  private router = inject(Router);
  private awardsSvc = inject(AwardsService);

  loading = signal(true);
  packs = signal<AwardPack[]>([]);
  earnings = signal<Earnings | null>(null);
  availableAmount = computed(() => this.earnings()?.available ?? 0);

  showWithdrawForm = signal(false);
  bankName = signal('');
  accountHolder = signal('');
  accountNumber = signal('');
  isSubmitting = signal(false);
  submitError = signal('');
  submitSuccess = signal('');

  ngOnInit() {
    this.awardsSvc.getPacks().subscribe({
      next: (p) => { this.packs.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
    this.awardsSvc.getEarnings().subscribe({
      next: (e) => { this.earnings.set(e ?? { totalEarnings: 0, withdrawn: 0, available: 0 }); },
      error: () => { this.earnings.set({ totalEarnings: 0, withdrawn: 0, available: 0 }); },
    });
  }

  back() { this.router.navigate([this.router.url.startsWith('/m/') ? '/m/profile' : '/profile']); }
  openWithdraw() { this.showWithdrawForm.set(true); this.submitError.set(''); this.submitSuccess.set(''); }
  closeWithdraw() { this.showWithdrawForm.set(false); this.submitError.set(''); }

  submitWithdraw() {
    const bankName = this.bankName().trim();
    const accountHolder = this.accountHolder().trim();
    const accountNumber = this.accountNumber().trim();
    if (!bankName || !accountHolder || !accountNumber) {
      this.submitError.set('يرجى ملء جميع الحقول');
      return;
    }
    this.isSubmitting.set(true);
    this.submitError.set('');
    this.submitSuccess.set('');
    this.awardsSvc.createWithdrawRequest({ bankName, accountHolder, accountNumber }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showWithdrawForm.set(false);
        this.submitSuccess.set('تم تقديم طلب السحب بنجاح');
        this.bankName.set(''); this.accountHolder.set(''); this.accountNumber.set('');
        this.awardsSvc.getEarnings().subscribe(e => this.earnings.set(e));
        setTimeout(() => this.submitSuccess.set(''), 4000);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.submitError.set(err?.error?.message ?? 'فشل تقديم الطلب');
      },
    });
  }

  toArabic(n: number | string): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  formatAmount(n: number | string): string { return this.toArabic(Math.round(Number(n)).toLocaleString('en')); }
}
