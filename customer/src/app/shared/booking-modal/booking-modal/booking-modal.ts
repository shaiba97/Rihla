import {
  Component, input, output, signal,
  computed, inject, OnInit,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';
import {
  LucideX,
  LucideArrowLeft,
  LucideArmchair,
  LucideUser,
  LucideCreditCard,
  LucideCheckCircle,
  LucideBus,
  LucideMapPin,
  LucideClock,
  LucideCalendar,
  LucideChevronLeft,
  LucideAlertCircle,
  LucideSmartphone,
  LucideLoader,
  LucideWallet,
  LucideLandmark,
  LucideUpload,
  LucideCheck,
  LucideShare2,
} from '@lucide/angular';
import { BookingStep, SeatMap, PassengerForm, ContactForm } from './booking.interfaces';
import { BookingService, BackendTrip } from '../../../services/booking/booking.service';
import { SessionService } from '../../../services/session/session.service';
import { TimeFormatPipe } from '../../../pipes/time-format/time-format-pipe';
import { ArabicNumberPipe } from '../../../pipes/arabic-number/arabic-number-pipe';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    DatePipe,
    TimeFormatPipe,
    ArabicNumberPipe,
    LucideX,
    LucideArrowLeft,
    LucideArmchair,
    LucideUser,
    LucideCreditCard,
    LucideCheckCircle,
    LucideBus,
    LucideMapPin,
    LucideClock,
    LucideCalendar,
    LucideChevronLeft,
    LucideAlertCircle,
    LucideSmartphone,
    LucideLoader,
    LucideWallet,
    LucideLandmark,
    LucideUpload,
    LucideCheck,
    LucideShare2,
  ],
  templateUrl: './booking-modal.component.html',
})
export class BookingModalComponent implements OnInit {
  tripId = input.required<string>();
  ticketId = input.required<string>();
  price = input.required<number>();
  currency = input<string>('جنيه');
  platformFee = input<number>(0);
  closed = output<void>();

  private bookingSvc = inject(BookingService);
  private sessionSvc = inject(SessionService);
  private fb = inject(FormBuilder);

  currentStep = signal<BookingStep>('seat');
  trip = signal<BackendTrip | null>(null);
  bookedSeats = signal<number[]>([]);
  selectedSeats = signal<number[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string>('');
  selectedGateway = signal<string | null>(null);
  submitSuccess = signal<boolean>(false);
  receiptFile = signal<File | null>(null);
  copied = signal<boolean>(false);
  bookingId = signal<string>('');

  seatMap = computed((): SeatMap[] => {
    const trip = this.trip();
    const booked = this.bookedSeats();
    const sel = this.selectedSeats();
    if (!trip) return [];
    const total = trip.Bus?.chairs || 45;
    return Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      return {
        seatNumber: n,
        status: sel.includes(n) ? 'selected' : booked.includes(n) ? 'booked' : 'available',
      };
    });
  });

  busRows = computed(() => {
    const seats = this.seatMap();
    const trip = this.trip();
    if (!seats.length || !trip) return { rows: [] as SeatMap[][], backSeats: [] as SeatMap[], left: 2, right: 2 };
    const total = trip.Bus?.chairs || 45;
    const backCount = 5;
    const mainSeats = seats.slice(0, total - backCount);
    const backSeats = seats.slice(total - backCount);
    const perRow = 4;
    const rows: SeatMap[][] = [];
    for (let i = 0; i < mainSeats.length; i += perRow) {
      rows.push(mainSeats.slice(i, i + perRow));
    }
    return { rows, backSeats, left: 2, right: 2 };
  });

  canGoToPassenger = computed(() => this.selectedSeats().length > 0);
  private contactFormValid = signal(false);
  private passengerFormValid = signal(false);
  canGoToPayment = computed(() => {
    return this.contactFormValid() && this.passengerFormValid() && this.selectedSeats().length > 0;
  });

  ticketPrice = computed(() => Number(this.price()) + this.platformFee());
  totalPayment = computed(() => this.ticketPrice() * this.selectedSeats().length);

  whatsappMessage = computed(() => {
    const trip = this.trip();
    const bid = this.bookingId();
    const seats = this.selectedSeats();
    const route = trip ? `${trip.fromCity} ← ${trip.toCity}` : '';
    const date = trip ? trip.departureDate : '';
    const time = trip ? trip.departureTime : '';
    return encodeURIComponent(
      `حجز رحلة: ${route}\nالتاريخ: ${date}\nالوقت: ${time}\nرقم الحجز: ${bid}\nالمقاعد: ${seats.join('، ')}\nالإجمالي: ${this.totalPayment()} ${this.currency()}`
    );
  });
  whatsappShare = computed(() => `https://wa.me/?text=${this.whatsappMessage()}`);

  contactForm = this.fb.group({
    countryCode: ['+249', Validators.required],
    whatsappNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
  });

  passengerForm = this.fb.group({
    passengers: this.fb.array([]),
  });

  get passengersArray(): FormArray {
    return this.passengerForm.get('passengers') as FormArray;
  }

  paymentAccounts = signal<any[]>([]);

  paymentGateways = computed(() =>
    this.paymentAccounts().map(acc => ({
      id: acc.id,
      name: acc.gatewayName,
      icon: this.iconForGateway(acc.gatewayName),
      accountNumber: acc.accountNumber,
      accountHolder: acc.accountHolder,
    }))
  );

  private iconForGateway(name: string): string {
    const n = name?.toLowerCase();
    if (n?.includes('بنكك') || n === 'bankak') return 'wallet';
    if (n?.includes('فوري') || n === 'fawry') return 'credit-card';
    if (n?.includes('مشرق') || n === 'mashriq' || n?.includes('bravo')) return 'landmark';
    return 'smartphone';
  }

  countryCodes = [
    { code: '+249', label: 'SD +249' },
    { code: '+20', label: 'EG +20' },
    { code: '+966', label: 'SA +966' },
    { code: '+971', label: 'AE +971' },
  ];

  paymentForm = this.fb.group({
    transactionId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.sessionSvc.init(this.tripId(), this.ticketId(), this.price(), this.currency());
    this.loadTrip();
    this.loadPaymentAccounts();
    this.contactFormValid.set(this.contactForm.valid);
    this.contactForm.statusChanges.subscribe(() => this.contactFormValid.set(this.contactForm.valid));
    this.passengerFormValid.set(this.passengerForm.valid);
    this.passengerForm.statusChanges.subscribe(() => this.passengerFormValid.set(this.passengerForm.valid));
  }

  loadPaymentAccounts(): void {
    this.bookingSvc.getActivePaymentAccounts().subscribe({
      next: (accounts: any[]) => this.paymentAccounts.set(accounts ?? []),
      error: () => {},
    });
  }

  loadTrip(): void {
    if (!this.tripId()) return;
    this.isLoading.set(true);
    this.bookingSvc.getTripDetails(this.tripId()).subscribe({
      next: (trip: BackendTrip | null) => {
        this.trip.set(trip);
        this.loadBookedSeats();
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('خطأ في تحميل بيانات الرحلة');
        this.isLoading.set(false);
      },
    });
  }

  loadBookedSeats(): void {
    this.bookingSvc.getBookedSeats(this.tripId()).subscribe({
      next: (res: { data?: number[] }) => this.bookedSeats.set(res.data ?? []),
      error: () => {},
    });
  }

  toggleSeat(seat: SeatMap): void {
    if (seat.status === 'booked') return;
    const current = this.selectedSeats();
    const exists = current.includes(seat.seatNumber);
    const updated = exists ? current.filter(s => s !== seat.seatNumber) : [...current, seat.seatNumber];
    this.selectedSeats.set(updated);
    this.sessionSvc.updateSeats(updated);
    this.syncPassengerForms(updated);
  }

  syncPassengerForms(seats: number[]): void {
    const arr = this.passengersArray;
    while (arr.length > seats.length) {
      arr.removeAt(arr.length - 1);
    }
    while (arr.length < seats.length) {
      arr.push(this.fb.group({
        seatNumber: [seats[arr.length]],
        name: ['', Validators.required],
        age: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
        gender: [null, Validators.required],
      }));
    }
    seats.forEach((s, i) => {
      arr.at(i).patchValue({ seatNumber: s });
    });
  }

  goToStep(step: BookingStep): void {
    if (step === 'passenger' && !this.canGoToPassenger()) return;
    if (step === 'payment' && !this.canGoToPayment()) return;
    this.currentStep.set(step);
  }

  seatClasses(seat: SeatMap): string[] {
    if (seat.status === 'selected')
      return ['bg-[var(--primary)]', 'text-white', 'border-[var(--primary)]', 'shadow-md'];
    if (seat.status === 'booked')
      return ['bg-[var(--border)]', 'text-[var(--text-muted)]', 'cursor-not-allowed', 'opacity-60'];
    return ['bg-[var(--bg-card)]', 'text-[var(--text-primary)]', 'border-[var(--border)]', 'hover:border-[var(--primary)]', 'hover:bg-[var(--primary-light)]', 'cursor-pointer'];
  }

  selectGateway(gw: string): void {
    this.selectedGateway.set(gw);
  }

  gatewayAccountNumber = computed(() => {
    const sel = this.selectedGateway();
    if (!sel) return '';
    const gw = this.paymentGateways().find(g => g.id === sel);
    return gw?.accountNumber ?? '';
  });

  async copyAccountNumber(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.gatewayAccountNumber());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {}
  }

  receiptFileName = computed(() => this.receiptFile()?.name ?? '');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.receiptFile.set(input.files[0]);
  }

  setGender(i: number, g: 'MALE' | 'FEMALE'): void {
    const ctrl = this.passengersArray.at(i).get('gender');
    ctrl?.setValue(g);
    ctrl?.markAsTouched();
  }

  invalid(c: any): boolean {
    return !!c && c.invalid && c.touched;
  }

  onClose(): void {
    this.sessionSvc.clear();
    this.closed.emit();
  }

  onSubmit(): void {
    if (!this.canGoToPayment() || !this.selectedGateway()) return;
    this.paymentForm.markAllAsTouched();
    if (this.paymentForm.invalid) return;

    this.isSubmitting.set(true);
    const contact = this.contactForm.value;
    const phone = `${contact.countryCode}${contact.whatsappNumber}`;
    const passengers = this.passengersArray.value as PassengerForm[];
    const gateway = this.paymentGateways().find(g => g.id === this.selectedGateway());

    this.bookingSvc.createBooking({
      tripId: this.tripId(),
      seatNumbers: this.selectedSeats(),
      passenger: passengers.map(p => ({
        name: p.name,
        age: Number(p.age),
        gender: p.gender!,
      })),
      passengerContact: phone,
    }).subscribe({
      next: (res: any) => {
        const booking = res?.data ?? res;
        this.bookingId.set(booking.id);
        const pm = this.paymentForm.value;
        this.bookingSvc.confirmPayment({
          bookingId: booking.id,
          customerId: '',
          paymentMethod: gateway?.name ?? this.selectedGateway()!,
          transactionId: pm.transactionId ?? '',
          receiptFile: this.receiptFile() ?? undefined,
          totalAmount: this.totalPayment(),
          baseAmount: this.selectedSeats().length * this.price(),
          platformFeeAmount: this.platformFee(),
          currency: this.currency(),
        }).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.sessionSvc.clear();
            this.submitSuccess.set(true);
          },
          error: (err: any) => {
            this.isSubmitting.set(false);
            this.error.set(err?.error?.message ?? 'حدث خطأ في تأكيد الدفع');
          },
        });
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.error.set(err?.error?.message ?? 'حدث خطأ في إنشاء الحجز');
      },
    });
  }
}
