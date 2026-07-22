import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideLoaderCircle, LucideAlertCircle, LucideRefreshCw, LucideMapPin, LucideCheck, LucideClock, LucideSend, LucideArrowLeft, LucideFileText, LucideLandmark, LucideBadgeCheck, LucideX, LucideBan, LucideEye, LucideBuilding2, LucidePencil } from '@lucide/angular';
import { PayoutService, PayoutTrip, PayoutRequest, PayoutRecord, CompanyAccount } from '../../../core/services/payout/payout.service';
import { WsService } from '../../../core/services/ws.service';
import { toArabicNumerals, formatArabicDate } from '../../../pipes/arabic-number/arabic-number.util';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payout',
  standalone: true,
  imports: [FormsModule, LucideLoaderCircle, LucideAlertCircle, LucideRefreshCw, LucideMapPin, LucideCheck, LucideClock, LucideSend, LucideArrowLeft, LucideFileText, LucideLandmark, LucideBadgeCheck, LucideX, LucideBan, LucideEye, LucideBuilding2, LucidePencil],
  templateUrl: './payout.html',
})
export class PayoutComponent implements OnInit, OnDestroy {
  private svc = inject(PayoutService);
  private ws = inject(WsService);
  private wsCleanups: (() => void)[] = [];

  trips = signal<PayoutTrip[]>([]);
  requests = signal<PayoutRequest[]>([]);
  history = signal<PayoutRecord[]>([]);
  stats = signal<{ totalUnpaidAmount: number; totalPaidAmount: number; pendingRequestCount: number } | null>(null);

  isLoading = signal(true);
  error = signal('');
  requestingTrip = signal<string | null>(null);
  requestingAll = signal(false);
  viewingReceipt = signal<string | null>(null);
  receiptError = signal(false);
  account = signal<CompanyAccount | null>(null);
  editingAccount = signal(false);
  savingAccount = signal(false);
  accountForm = signal<CompanyAccount>({ accountHolderName: null, bankName: null, accountNumber: null });

  ngOnInit() {
    this.load();
    this.wsCleanups.push(this.ws.on('payout:updated', () => this.load()));
  }

  ngOnDestroy() { this.wsCleanups.forEach(fn => fn()); }

  totalUnpaid = () => this.trips().reduce((sum, t) => sum + (t.paidOut ? 0 : t.unpaidAmount), 0);

  allDisabled = () => this.trips().length === 0 || this.trips().every(t => t.paidOut || t.hasPendingRequest);

  load() {
    this.isLoading.set(true);
    this.error.set('');
    this.svc.getTrips().subscribe({
      next: r => this.trips.set(r.data),
      error: () => {},
    });
    this.svc.getRequests().subscribe({
      next: r => this.requests.set(r.data),
      error: () => {},
    });
    this.svc.getHistory().subscribe({
      next: r => this.history.set(r.data),
      error: () => {},
    });
    this.svc.getDashboardStats().subscribe({
      next: r => { this.stats.set(r.data); this.isLoading.set(false); },
      error: e => { this.error.set(e?.error?.message ?? 'حدث خطأ'); this.isLoading.set(false); },
    });
    this.svc.getAccount().subscribe({
      next: r => { this.account.set(r.data); this.accountForm.set({ ...r.data }); },
      error: () => {},
    });
  }

  requestSingle(tripId: string) {
    this.requestingTrip.set(tripId);
    this.svc.requestPayout(tripId).subscribe({
      next: () => {
        this.requestingTrip.set(null);
        this.load();
      },
      error: () => {
        this.requestingTrip.set(null);
      },
    });
  }

  requestAll() {
    this.requestingAll.set(true);
    this.svc.requestPayout().subscribe({
      next: () => {
        this.requestingAll.set(false);
        this.load();
      },
      error: () => {
        this.requestingAll.set(false);
      },
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-200';
      case 'CANCELLED': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'قيد الانتظار';
      case 'APPROVED': return 'تمت الموافقة';
      case 'REJECTED': return 'مرفوض';
      case 'CANCELLED': return 'ملغي';
      default: return status;
    }
  }

  toArabic(n: number | string): string { return toArabicNumerals(n); }
  fmtDate(d: string): string { return formatArabicDate(d); }
  fmtPrice(n: number): string { return `${toArabicNumerals(n)} ج.س`; }

  getReceiptForTrip(tripId: string): string | null {
    for (const rec of this.history()) {
      if (rec.receiptFile && rec.items.some(item => item.trip.id === tripId)) {
        return rec.receiptFile;
      }
    }
    return null;
  }

  getFileUrl(path: string): string {
    return path.startsWith('http') ? path : `${environment.apiUrl.company.replace('/api-company', '')}${path}`;
  }

  viewReceipt(url: string): void {
    this.receiptError.set(false);
    this.viewingReceipt.set(this.getFileUrl(url));
  }

  closeReceipt(): void {
    this.viewingReceipt.set(null);
    this.receiptError.set(false);
  }

  toggleEditAccount(): void {
    this.editingAccount.update(v => !v);
  }

  successMsg = signal('');

  saveAccount(): void {
    this.savingAccount.set(true);
    this.error.set('');
    this.successMsg.set('');
    this.svc.updateAccount(this.accountForm()).subscribe({
      next: r => {
        this.account.set(r.data);
        this.accountForm.set({ ...r.data });
        this.savingAccount.set(false);
        this.editingAccount.set(false);
        this.successMsg.set('تم حفظ بيانات الحساب بنجاح');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: e => { this.savingAccount.set(false); this.error.set(e?.error?.message ?? 'فشل حفظ بيانات الحساب'); },
    });
  }
}
