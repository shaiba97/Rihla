import { Component, signal, inject, OnInit, computed, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideWallet, LucideTrendingUp, LucideClock, LucidePlus, LucidePencil, LucideTrash2, LucideCheck, LucideX, LucideLoaderCircle, LucideRefreshCw, LucideEye, LucideCreditCard, LucideBadgeDollarSign, LucideToggleLeft, LucideToggleRight, LucideReceiptText, LucideShield, LucideActivity, LucideBarChart3 } from '@lucide/angular';
import { FinancialService } from '../../core/services/financial/financial.service';
import { PlatformFeeService } from '../../core/services/platform-fee/platform-fee.service';
import { PaymentAccountsService } from '../../core/services/payment-accounts/payment-accounts.service';
import { environment } from '../../../environments/environment';
import { WsService } from '../../core/services/ws.service';

type Tab = 'overview' | 'pending' | 'platform-fee' | 'expenses' | 'accounts' | 'performance';

@Component({
  selector: 'app-financial',
  imports: [FormsModule, LucideWallet, LucideTrendingUp, LucideClock, LucidePlus, LucidePencil, LucideTrash2, LucideCheck, LucideX, LucideLoaderCircle, LucideRefreshCw, LucideEye, LucideCreditCard, LucideBadgeDollarSign, LucideToggleLeft, LucideToggleRight, LucideReceiptText, LucideShield, LucideActivity, LucideBarChart3],
  templateUrl: './financial.html',
})
export class FinancialComponent implements OnInit, OnDestroy {
  private financialSvc = inject(FinancialService);
  private feeSvc = inject(PlatformFeeService);
  private accountsSvc = inject(PaymentAccountsService);
  private ws = inject(WsService);

  private wsCleanups: (() => void)[] = [];

  activeTab = signal<Tab>('overview');
  earningsPeriod = signal<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  earningsData = signal<any[]>([]);
  earningsPeriods = [
    { id: 'daily' as const, label: 'يومي' },
    { id: 'weekly' as const, label: 'أسبوعي' },
    { id: 'monthly' as const, label: 'شهري' },
    { id: 'yearly' as const, label: 'سنوي' },
  ];
  tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: 'activity' },
    { id: 'pending', label: 'طلبات الدفع', icon: 'clock' },
    { id: 'platform-fee', label: 'رسوم المنصة', icon: 'badge-dollar-sign' },
    { id: 'expenses', label: 'المصروفات', icon: 'receipt-text' },
    { id: 'accounts', label: 'حسابات الدفع', icon: 'credit-card' },
    { id: 'performance', label: 'الأداء المالي', icon: 'bar-chart' },
  ];

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

  overview = signal<any>(null);
  pendingList = signal<any[]>([]);
  fees = signal<any[]>([]);
  expenses = signal<any[]>([]);
  accounts = signal<any[]>([]);
  isLoading = signal(false);
  error = signal('');
  successMsg = signal('');

  confirmingId = signal<string | null>(null);
  rejectingId = signal<string | null>(null);
  rejectReason = signal('');
  viewingReceipt = signal<string | null>(null);

  showFeeForm = signal(false);
  editingFeeId = signal<string | null>(null);
  feeAmount = signal(0);
  feeCurrency = signal('جنيه سوداني');
  feeLabel = signal('');
  isSavingFee = signal(false);

  showExpenseForm = signal(false);
  editingExpenseId = signal<string | null>(null);
  expenseAmount = signal(0);
  expenseReason = signal('');
  isSavingExpense = signal(false);

  showAccForm = signal(false);
  editingAccId = signal<string | null>(null);
  accHolder = signal('');
  accNumber = signal('');
  accGateway = signal('');
  isSavingAcc = signal(false);
  gatewayOptions = ['بنكك', 'فوري', 'المشرق', 'برافو', 'MTN Cash', 'Zain Cash'];

  pendingCount = computed(() => this.pendingList().length);

  ngOnInit(): void {
    this.refresh();
    this.wsCleanups.push(this.ws.on('payment:created', () => this.loadTab(this.activeTab())));
    this.wsCleanups.push(this.ws.on('payment:confirmed', () => this.loadTab(this.activeTab())));
    this.wsCleanups.push(this.ws.on('payment:rejected', () => this.loadTab(this.activeTab())));
    this.wsCleanups.push(this.ws.on('financial:updated', () => this.loadTab(this.activeTab())));
  }

  ngOnDestroy() { this.wsCleanups.forEach(fn => fn()); }

  refresh(): void {
    console.log('Refreshing financial data...');
    this.loadOverview(); this.loadEarnings(); this.loadPending(); this.loadFees(); this.loadExpenses(); this.loadAccounts(); this.loadPerformance();
  }

  loadOverview(): void { this.financialSvc.getOverview().subscribe({ next: (r: any) => this.overview.set(r?.data ?? r), error: () => {} }); }
  loadEarnings(): void { this.financialSvc.getEarnings(this.earningsPeriod()).subscribe({ next: (r: any) => this.earningsData.set(r?.data ?? r ?? []), error: () => {} }); }
  setPeriod(p: 'daily' | 'weekly' | 'monthly' | 'yearly'): void { this.earningsPeriod.set(p); this.loadEarnings(); }
  loadPerformance(): void { this.financialSvc.getPerformance(this.perfPeriod()).subscribe({ next: (r: any) => this.perfData.set(r?.data ?? r ?? []), error: () => {} }); }
  setPerfPeriod(p: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'): void { this.perfPeriod.set(p); this.loadPerformance(); }
  loadPending(): void { this.financialSvc.getPending().subscribe({ next: (r: any) => this.pendingList.set(r?.data ?? r ?? []), error: () => {} }); }
  loadFees(): void { this.feeSvc.getAll().subscribe({ next: (r: any) => this.fees.set(r?.data ?? r ?? []), error: () => {} }); }
  loadExpenses(): void { this.financialSvc.getExpenses().subscribe({ next: (r: any) => this.expenses.set(r?.data ?? r ?? []), error: () => {} }); }
  loadAccounts(): void { this.accountsSvc.getAll().subscribe({ next: (r: any) => this.accounts.set(r?.data ?? r ?? []), error: () => {} }); }

  loadTab(tab: Tab): void {
    switch (tab) {
      case 'overview': this.loadOverview(); this.loadEarnings(); break;
      case 'pending': this.loadPending(); break;
      case 'platform-fee': this.loadFees(); break;
      case 'expenses': this.loadExpenses(); break;
      case 'accounts': this.loadAccounts(); break;
      case 'performance': this.loadPerformance(); break;
    }
  }

  switchTab(tab: Tab): void { this.activeTab.set(tab); this.error.set(''); this.successMsg.set(''); this.loadTab(tab); }

  startConfirm(id: string): void { this.confirmingId.set(id); }
  cancelConfirm(): void { this.confirmingId.set(null); }
  confirmPayment(id: string): void {
    this.financialSvc.confirmPayment(id).subscribe({ next: () => { this.confirmingId.set(null); this.showSuccess('تم تأكيد الدفعة والحجز بنجاح ✓'); this.refresh(); }, error: (e: any) => { this.showError(e?.error?.message ?? 'حدث خطأ أثناء التأكيد'); this.confirmingId.set(null); } });
  }

  startReject(id: string): void { this.rejectingId.set(id); this.rejectReason.set(''); }
  cancelReject(): void { this.rejectingId.set(null); this.rejectReason.set(''); }
  rejectPayment(id: string): void {
    this.financialSvc.rejectPayment(id, this.rejectReason()).subscribe({ next: () => { this.rejectingId.set(null); this.showSuccess('تم رفض الدفعة وإلغاء الحجز'); this.refresh(); }, error: (e: any) => { this.showError(e?.error?.message ?? 'حدث خطأ أثناء الرفض'); this.rejectingId.set(null); } });
  }

  viewReceipt(url: string): void { this.viewingReceipt.set(url.startsWith('http') ? url : `${environment.apiUrl.admin.replace('/api', '')}${url}`); }
  closeReceipt(): void { this.viewingReceipt.set(null); }

  openCreateFee(): void { this.editingFeeId.set(null); this.feeAmount.set(0); this.feeCurrency.set('جنيه سوداني'); this.feeLabel.set(''); this.showFeeForm.set(true); }
  openEditFee(fee: any): void { this.editingFeeId.set(fee.id); this.feeAmount.set(Number(fee.amount)); this.feeCurrency.set(fee.currency); this.feeLabel.set(fee.label ?? ''); this.showFeeForm.set(true); }
  closeFeeForm(): void { this.showFeeForm.set(false); this.editingFeeId.set(null); }
  saveFee(): void {
    if (!this.feeAmount() || this.feeAmount() <= 0) { this.showError('يرجى إدخال مبلغ صحيح'); return; }
    this.isSavingFee.set(true);
    const data = { amount: this.feeAmount(), currency: this.feeCurrency(), label: this.feeLabel() || undefined };
    (this.editingFeeId() ? this.feeSvc.update(this.editingFeeId()!, data) : this.feeSvc.create(data)).subscribe({ next: () => { this.isSavingFee.set(false); this.closeFeeForm(); this.showSuccess('تم حفظ الرسوم بنجاح'); this.loadFees(); this.loadOverview(); }, error: (e: any) => { this.showError(e?.error?.message ?? 'حدث خطأ'); this.isSavingFee.set(false); } });
  }
  activateFee(id: string): void { this.feeSvc.activate(id).subscribe({ next: () => { this.showSuccess('تم تفعيل الرسوم'); this.loadFees(); this.loadOverview(); }, error: (e: any) => this.showError(e?.error?.message) }); }
  deleteFee(id: string): void { if (!confirm('هل أنت متأكد من حذف هذه الرسوم؟')) return; this.feeSvc.remove(id).subscribe({ next: () => { this.showSuccess('تم الحذف'); this.loadFees(); }, error: (e: any) => this.showError(e?.error?.message) }); }

  openCreateAcc(): void { this.editingAccId.set(null); this.accHolder.set(''); this.accNumber.set(''); this.accGateway.set(''); this.showAccForm.set(true); }
  openEditAcc(acc: any): void { this.editingAccId.set(acc.id); this.accHolder.set(acc.accountHolder); this.accNumber.set(acc.accountNumber); this.accGateway.set(acc.gatewayName ?? acc.gatewayKey); this.showAccForm.set(true); }
  closeAccForm(): void { this.showAccForm.set(false); this.editingAccId.set(null); }
  saveAcc(): void {
    if (!this.accHolder().trim() || !this.accNumber().trim() || !this.accGateway().trim()) { this.showError('يرجى تعبئة جميع الحقول'); return; }
    this.isSavingAcc.set(true);
    const data = { accountHolder: this.accHolder().trim(), accountNumber: this.accNumber().trim(), gatewayName: this.accGateway().trim() };
    (this.editingAccId() ? this.accountsSvc.update(this.editingAccId()!, data) : this.accountsSvc.create(data)).subscribe({ next: () => { this.isSavingAcc.set(false); this.closeAccForm(); this.showSuccess('تم حفظ الحساب بنجاح'); this.loadAccounts(); }, error: (e: any) => { this.showError(e?.error?.message ?? 'حدث خطأ'); this.isSavingAcc.set(false); } });
  }
  toggleAccount(id: string): void { this.accountsSvc.toggleActive(id).subscribe({ next: () => { this.showSuccess('تم تحديث الحالة'); this.loadAccounts(); }, error: (e: any) => this.showError(e?.error?.message) }); }
  deleteAccount(id: string): void { if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return; this.accountsSvc.remove(id).subscribe({ next: () => { this.showSuccess('تم الحذف'); this.loadAccounts(); }, error: (e: any) => this.showError(e?.error?.message) }); }

  openCreateExpense(): void { this.editingExpenseId.set(null); this.expenseAmount.set(0); this.expenseReason.set(''); this.showExpenseForm.set(true); }
  openEditExpense(e: any): void { this.editingExpenseId.set(e.id); this.expenseAmount.set(Number(e.amount)); this.expenseReason.set(e.reason); this.showExpenseForm.set(true); }
  closeExpenseForm(): void { this.showExpenseForm.set(false); this.editingExpenseId.set(null); }
  saveExpense(): void {
    if (!this.expenseAmount() || this.expenseAmount() <= 0 || !this.expenseReason().trim()) { this.showError('يرجى تعبئة جميع الحقول'); return; }
    this.isSavingExpense.set(true);
    const data = { amount: this.expenseAmount(), reason: this.expenseReason().trim() };
    (this.editingExpenseId() ? this.financialSvc.updateExpense(this.editingExpenseId()!, data) : this.financialSvc.createExpense(data)).subscribe({ next: () => { this.isSavingExpense.set(false); this.closeExpenseForm(); this.showSuccess('تم حفظ المصروف'); this.loadExpenses(); this.loadOverview(); }, error: (e: any) => { this.showError(e?.error?.message ?? 'حدث خطأ'); this.isSavingExpense.set(false); } });
  }
  deleteExpense(id: string): void { if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return; this.financialSvc.deleteExpense(id).subscribe({ next: () => { this.showSuccess('تم الحذف'); this.loadExpenses(); this.loadOverview(); }, error: (e: any) => this.showError(e?.error?.message) }); }

  showSuccess(msg: string): void { this.successMsg.set(msg); this.error.set(''); setTimeout(() => this.successMsg.set(''), 4000); }
  showError(msg: string): void { this.error.set(msg ?? 'حدث خطأ'); this.successMsg.set(''); setTimeout(() => this.error.set(''), 5000); }

  toArabic(n: number | string): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  formatAmount(n: number): string { return this.toArabic(Math.round(n).toLocaleString('en')); }
  fmtDate(d: any): string { if (!d) return '—'; return this.toArabic(new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })); }
  statusLabel(s: string): string { const m: Record<string, string> = { PENDING: 'قيد الانتظار', SUCCESS: 'مؤكد', FAILED: 'مرفوض', REFUNDED: 'مسترد' }; return m[s] ?? s; }
  statusClasses(s: string): string[] {
    if (s === 'SUCCESS') return ['bg-[var(--success-light)]', 'text-[var(--success)]'];
    if (s === 'FAILED') return ['bg-[var(--danger-light)]', 'text-[var(--danger)]'];
    if (s === 'PENDING') return ['bg-[var(--warning-light)]', 'text-[var(--warning)]'];
    return ['bg-[var(--primary-light)]', 'text-[var(--text-primary)]'];
  }
  methodLabel(m: string): string { const map: Record<string, string> = { bankak: 'بنكك', fawry: 'فوري', mashriq: 'المشرق', bravo: 'برافو' }; return map[m] ?? m; }
}
