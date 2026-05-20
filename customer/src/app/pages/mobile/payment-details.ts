import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideArrowRight, LucideCheckCircle, LucideAlertCircle, LucideClock, LucideUpload, LucideCreditCard, LucideCopy, LucideCheck } from '@lucide/angular';
import { BookingService } from '../../services/booking/booking.service';
import { SessionService } from '../../services/session/session.service';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';
import { formatArabicDateTime, formatArabicTime } from '../../pipes/arabic-number/arabic-number.util';

@Component({
  selector: 'app-payment-details',
  imports: [ReactiveFormsModule, ArabicNumberPipe, LucideArrowRight, LucideCheckCircle, LucideAlertCircle, LucideClock, LucideUpload, LucideCreditCard, LucideCopy, LucideCheck],
  templateUrl: './payment-details.html',
})
export class PaymentDetails implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private bookingSvc = inject(BookingService);
  private sessionSvc = inject(SessionService);

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

  paymentMethods = [
    { id: 'bankak', label: 'بنكك', icon: 'bankak' },
    { id: 'fawry', label: 'فوري', icon: 'fawry' },
    { id: 'mashriq', label: 'مصرف', icon: 'mashriq' },
    { id: 'bravo', label: 'برافو', icon: 'bravo' },
  ];

  accountNumbers: Record<string, { bank: string; number: string }[]> = {
    bankak: [
      { bank: 'بنكك - الخرطوم', number: '1234567890123456' },
    ],
    fawry: [
      { bank: 'فوري - الخرطوم', number: '6543210987654321' },
    ],
    mashriq: [
      { bank: 'مصرف - الخرطوم', number: '1111222233334444' },
    ],
    bravo: [
      { bank: 'برافو - الخرطوم', number: '5555666677778888' },
    ],
  };

  formattedDate = computed(() => formatArabicDateTime(this.trip()?.tripDate, this.trip()?.tripTime));
  formattedTime = computed(() => formatArabicTime(this.trip()?.tripTime));
  formattedSeats = computed(() => this.selectedSeats().join('، '));

  paymentForm = this.fb.group({
    paymentMethod: ['bankak', Validators.required],
    transactionId: ['', Validators.required],
  });

  private paymentStatus = toSignal(this.paymentForm.statusChanges, { initialValue: 'INVALID' });
  canSubmit = computed(() => this.paymentStatus() === 'VALID' && !this.isSubmitting());
  remainingTime = computed(() => this.sessionSvc.remainingFormatted());
  isExpired = computed(() => this.sessionSvc.isExpired());

  ngOnInit(): void {
    const s = history.state;
    if (!s?.trip || !s?.selectedSeats) {
      this.router.navigate(['/m']);
      return;
    }
    this.trip.set(s.trip);
    this.selectedSeats.set(s.selectedSeats ?? []);
    this.baseAmount.set(s?.baseAmount ?? 0);
    this.platformFee.set(s?.platformFee ?? 0);
    this.totalAmount.set(s.totalAmount ?? 0);
    this.contact.set(s.contact ?? null);
    this.passengers.set(s.passengers ?? []);
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

    this.bookingSvc.createBookingWithPayment({
      tripId: trip.id,
      seatNumbers: selectedSeats,
      passenger: passengers.map((p: any) => ({ name: p.name, age: Number(p.age), gender: p.gender })),
      passengerContact: `${contact?.countryCode ?? '+249'}${contact?.whatsappNumber ?? ''}`,
      paymentMethod: formVal.paymentMethod!,
      transactionId: formVal.transactionId!,
      receiptFile: this.receiptFile() ?? undefined,
      totalAmount: this.totalAmount(),
      baseAmount: this.baseAmount(),
      platformFeeAmount: this.platformFee(),
      currency: 'SDG',
    }).subscribe({
      next: () => {
        this.submitSuccess.set(true);
        this.sessionSvc.clear();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.submitError.set(err?.error?.message ?? 'فشل إنشاء الحجز');
        this.isSubmitting.set(false);
      },
    });
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

  selectedGateway = computed(() => this.paymentForm.get('paymentMethod')?.value ?? 'bankak');

  selectedAccountNumber = computed(() => {
    const gw = this.selectedGateway();
    const accounts = this.accountNumbers[gw];
    return accounts && accounts.length > 0 ? accounts[0].number : null;
  });

  selectedAccountBank = computed(() => {
    const gw = this.selectedGateway();
    const accounts = this.accountNumbers[gw];
    return accounts && accounts.length > 0 ? accounts[0].bank : null;
  });

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
