import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideArrowRight, LucideClock, LucideUpload, LucideCreditCard, LucideCopy, LucideCheck, LucideLogIn } from '@lucide/angular';
import { BookingService } from '../../services/booking/booking.service';
import { SessionService } from '../../services/session/session.service';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';
import { formatArabicDateTime, formatArabicTime } from '../../pipes/arabic-number/arabic-number.util';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-payment-details',
  imports: [ReactiveFormsModule, ArabicNumberPipe, LucideArrowRight, LucideClock, LucideUpload, LucideCreditCard, LucideCopy, LucideCheck, LucideLogIn],
  templateUrl: './payment-details.html',
})
export class PaymentDetails implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private bookingSvc = inject(BookingService);
  private sessionSvc = inject(SessionService);
  private authStore = inject(AuthStoreService);

  trip = signal<any>(null);
  selectedSeats = signal<number[]>([]);
  baseAmount = signal<number>(0);
  platformFee = signal<number>(0);
  totalAmount = signal<number>(0);
  contact = signal<any>(null);
  passengers = signal<any[]>([]);
  isSubmitting = signal<boolean>(false);
  submitError = signal<string>('');
  submitSuccess = signal<boolean>(false);
  receiptFile = signal<File | null>(null);
  receiptFileName = signal<string>('');
  copied = signal<string | null>(null);
  copySuccess = signal<boolean>(false);
  showLoginPrompt = signal<boolean>(false);

  paymentAccounts = signal<any[]>([]);

  paymentMethods = computed(() =>
    this.paymentAccounts().map(a => ({
      id: a.id,
      label: a.gatewayName,
      icon: this.iconForGateway(a.gatewayName),
    }))
  );

  private iconForGateway(name: string): string {
    const n = name?.toLowerCase();
    if (n?.includes('بنكك') || n === 'bankak') return 'wallet';
    if (n?.includes('فوري') || n === 'fawry') return 'credit-card';
    if (n?.includes('مشرق') || n === 'mashriq') return 'landmark';
    if (n?.includes('برافو') || n === 'bravo') return 'smartphone';
    return 'credit-card';
  }

  paymentForm = this.fb.group({
    paymentMethod: ['', Validators.required],
    transactionId: ['', Validators.required],
  });

  selectedMethodId = toSignal(this.paymentForm.get('paymentMethod')!.valueChanges, { initialValue: '' });

  selectedAccount = computed(() => {
    const id = this.selectedMethodId();
    if (!id) return null;
    return this.paymentAccounts().find(a => a.id === id) ?? null;
  });

  selectedAccountNumber = computed(() => this.selectedAccount()?.accountNumber ?? null);
  selectedAccountBank = computed(() => this.selectedAccount()?.accountHolder ?? null);

  formattedDate = computed(() => formatArabicDateTime(this.trip()?.tripDate, this.trip()?.tripTime));
  formattedTime = computed(() => formatArabicTime(this.trip()?.tripTime));
  formattedSeats = computed(() => this.selectedSeats().join('، '));

  private paymentStatus = toSignal(this.paymentForm.statusChanges, { initialValue: 'INVALID' });
  canSubmit = computed(() => this.paymentStatus() === 'VALID' && !this.isSubmitting());
  remainingTime = computed(() => this.sessionSvc.remainingFormatted());
  isExpired = computed(() => this.sessionSvc.isExpired());

  ngOnInit(): void {
    if (!this.authStore.isLoggedIn()) {
      this.showLoginPrompt.set(true);
      return;
    }
    const s = history.state;
    if (!s?.trip || !s?.selectedSeats) {
      this.router.navigate(['../home'], { relativeTo: this.route });
      return;
    }
    this.trip.set(s.trip);
    this.selectedSeats.set(s.selectedSeats ?? []);
    this.baseAmount.set(s?.baseAmount ?? 0);
    this.platformFee.set(s?.platformFee ?? 0);
    this.totalAmount.set(s.totalAmount ?? 0);
    this.contact.set(s.contact ?? null);
    this.passengers.set(s.passengers ?? []);
    this.sessionSvc.onExpire = () => {
      this.router.navigate(['../seat', s.trip.id], { relativeTo: this.route });
    };
    this.bookingSvc.getActivePaymentAccounts().subscribe({
      next: (accounts: any[]) => {
        if (accounts && accounts.length > 0) {
          this.paymentAccounts.set(accounts);
          this.paymentForm.get('paymentMethod')?.setValue(accounts[0].id);
        }
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.receiptFile.set(input.files[0]);
      this.receiptFileName.set(input.files[0].name);
    }
  }

  onSubmit(): void {
    if (!this.canSubmit() || !this.receiptFile()) {
      this.submitError.set('يرجى اختيار طريقة الدفع وإرفاق إيصال الدفع');
      return;
    }
    this.isSubmitting.set(true);
    this.submitError.set('');

    const trip = this.trip();
    const contact = this.contact();
    const passengers = this.passengers();
    const selectedSeats = this.selectedSeats();
    const formVal = this.paymentForm.value;
    const seatCount = selectedSeats.length;
    const tripPrice = Number(trip?.price ?? 0);
    const perSeatFee = this.platformFee();
    const companyAmount = tripPrice * seatCount;
    const platformFeeAmount = perSeatFee * seatCount;
    const totalAmount = companyAmount + platformFeeAmount;

    const selectedAccount = this.selectedAccount();
    this.bookingSvc.createBookingWithPayment({
      tripId: trip.id,
      seatNumbers: selectedSeats,
      passenger: passengers.map((p: any) => ({ name: p.name, age: Number(p.age), gender: p.gender })),
      passengerContact: `${contact?.countryCode ?? '+249'}${contact?.whatsappNumber ?? ''}`,
      paymentMethod: selectedAccount?.gatewayName ?? formVal.paymentMethod!,
      transactionId: formVal.transactionId!,
      receiptFile: this.receiptFile() ?? undefined,
      totalAmount,
      baseAmount: companyAmount,
      platformFeeAmount,
      price: tripPrice,
      currency: 'SDG',
    }).subscribe({
      next: () => {
        this.submitSuccess.set(true);
        this.sessionSvc.releaseSeats();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.submitError.set(err?.error?.message ?? 'فشل إنشاء الحجز');
        this.isSubmitting.set(false);
      },
    });
  }

  goToLogin(): void {
    const prefix = this.router.url.startsWith('/m') ? '/m' : '';
    this.router.navigate([prefix + '/login']);
  }
  goHome(): void {
    this.router.navigate(['/m']);
  }

  goBack(): void {
    history.back();
  }

  invalid(c: any): boolean {
    return c && c.invalid && c.touched;
  }

  async copyAccountNumber(): Promise<void> {
    const num = this.selectedAccountNumber();
    if (!num) return;
    try {
      await navigator.clipboard.writeText(num);
      this.copied.set(num);
      this.copySuccess.set(true);
      setTimeout(() => { this.copySuccess.set(false); this.copied.set(null); }, 2000);
    } catch { }
  }
}
