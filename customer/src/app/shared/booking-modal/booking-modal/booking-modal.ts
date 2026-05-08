import {
  Component, input, output, signal,
  computed, inject, OnInit, OnChanges, SimpleChanges,
} from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import {
  LucideX,
  LucideArrowLeft,
  LucideArmchair,
  LucideUser,
  LucideCreditCard,
  LucideLoader,
  LucideDownload,
  LucideCheckCircle,
  LucideClock,
} from '@lucide/angular';
import {
  BookingStep,
  SeatMap,
  SeatStatus,
  ContactForm,
  PassengerForm,
  PaymentGateway,
} from './booking.interfaces';
import { BookingService, TripDetails }
  from '../../../core/services/booking/booking';
import { TimeFormatPipe }
  from '../../../pipes/time-format/time-format-pipe';
import { SeatStepComponent }
  from '../steps/seat-step/seat-step';
import { PassengerStepComponent }
  from '../steps/passenger-step/passenger-step';
import { PaymentStepComponent }
  from '../steps/payment-step/payment-step';
import { environment } from '../../../../environments/environment';
import { Trips } from '../../../core/services/trips-service/trips';
import { SessionService } from '../../../core/services/session/session';

@Component({
  selector:   'app-booking-modal',
  standalone: true,
  imports: [
    NgClass,
    LucideX,
    LucideArrowLeft,
    LucideArmchair,
    LucideUser,
    LucideCreditCard,
    LucideLoader,
    LucideDownload,
    LucideCheckCircle,
    LucideClock,
    SeatStepComponent,
    PassengerStepComponent,
    PaymentStepComponent,
  ],
  templateUrl: './booking-modal.html',
})
export class BookingModalComponent
  implements OnInit, OnChanges {

  tripId  = input.required<string>();
  ticketId = input.required<string>();
  price   = input.required<number>();
  currency = input<string>('جنيه');
  closed  = output<void>();

  protected sessionService = inject(SessionService);
  private bookingService = inject(BookingService);
  private tripService = inject(Trips);

  currentStep    = signal<BookingStep>('seat');
  tripDetails    = signal<TripDetails | null>(null);
  bookedSeats    = signal<number[]>([]);
  heldSeats      = signal<number[]>([]);
  selectedSeats  = signal<number[]>([]);
  isLoading      = signal<boolean>(false);
  isSubmitting   = signal<boolean>(false);
  error          = signal<string>('');
  isSuccess      = signal<boolean>(false);
  isExpired      = signal<boolean>(false);
  bookingResults = signal<any[]>([]);
  ticketUrls     = signal<string[]>([]);
  ticketBaseUrl  = environment.apiUrl.customer.replace('/api', '');
  totalPrice = computed(() => this.selectedSeats().length * this.price());

  savedContact    = signal<ContactForm | null>(null);
  savedPassengers = signal<PassengerForm[]>([]);

  seatMap = computed((): SeatMap[] => {
    const trip    = this.tripDetails();
    const booked  = this.bookedSeats();
    const held    = this.heldSeats();
    const sel     = this.selectedSeats();
    if (!trip) return [];
    const total   = trip.Bus?.chairs || 45;
    return Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      let status: SeatStatus = 'available';

      if (booked.includes(n)) {
        status = 'booked';
      } else if (sel.includes(n)) {
        status = 'reserved';
      } else if (held.includes(n)) {
        status = 'held';
      }

      return { seatNumber: n, status };
    });
  });

  canGoToPassenger = computed(
    () => this.selectedSeats().length > 0
  );

  canGoToPayment = computed(() =>
    this.savedContact() !== null &&
    this.savedPassengers().length > 0 &&
    this.savedPassengers().length ===
      this.selectedSeats().length
  );

  ngOnInit(): void {
    this.loadTrip();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tripId'] && this.tripId()) {
      this.loadTrip();
    }
  }

  loadTrip(): void {
    if (!this.tripId()) return;
    this.isLoading.set(true);
    this.tripService
      .getTripByProperty('id', this.tripId())
      .subscribe({
        next: (res: any) => {
          this.tripDetails.set(res);
          this.loadBookedSeats();
          this.isLoading.set(false);

          // Register expiry handler
          this.sessionService.onExpire(() => {
            this.isExpired.set(true);
            this.selectedSeats.set([]);
            this.sessionService.clear();
          });

          // Check if resuming existing session
          const existing = this.sessionService.session();
          if (existing &&
              existing.tripId === this.tripId() &&
              !this.sessionService.isExpired()) {

            this.selectedSeats.set(existing.selectedSeats);

            if (existing.savedContact) {
              this.savedContact.set(existing.savedContact);
            }
            if (existing.savedPassengers.length > 0) {
              this.savedPassengers.set(existing.savedPassengers);
            }

            const savedStep = existing.step;
            if (savedStep === 'passenger' &&
                existing.selectedSeats.length > 0) {
              this.currentStep.set('passenger');
            } else if (savedStep === 'payment' &&
                       existing.savedContact !== null) {
              this.currentStep.set('payment');
            }
          } else {
            // New session
            this.sessionService.init(
              this.tripId(),
              this.ticketId(),
              this.price(),
              this.currency(),
            );
          }

          // Load held seats from backend
          this.bookingService
            .getHeldSeats(this.tripId())
            .subscribe({
              next: (res) =>
                this.heldSeats.set(res.data ?? []),
              error: () => {},
            });
        },
        error: (err) => {
          this.error.set(
            err?.error?.message ??
            'فشل في تحميل بيانات الرحلة'
          );
          this.isLoading.set(false);
        },
      });
  }

  loadBookedSeats(): void {
    this.bookingService
      .getBookedSeats(this.tripId())
      .subscribe({
        next: (res) =>
          this.bookedSeats.set(res.data ?? []),
        error: () => {},
      });
  }

  toggleSeat(seat: SeatMap): void {
    if (seat.status === 'booked' ||
        seat.status === 'held') return;

    const current = this.selectedSeats();
    const exists  = current.includes(seat.seatNumber);
    const updated = exists
      ? current.filter(s => s !== seat.seatNumber)
      : [...current, seat.seatNumber];

    this.selectedSeats.set(updated);
    this.sessionService.updateSeats(updated);
  }

  goToStep(
    step: 'seat' | 'passenger' | 'payment'
  ): void {
    if (step === 'passenger' &&
        !this.canGoToPassenger()) return;
    if (step === 'payment' &&
        !this.canGoToPayment()) return;
    this.currentStep.set(step);
    this.sessionService.updateStep(step);
  }

  onPassengerComplete(data: {
    contact:    ContactForm;
    passengers: PassengerForm[];
  }): void {
    this.savedContact.set(data.contact);
    this.savedPassengers.set(data.passengers);
    this.sessionService.updateContact(data.contact);
    this.sessionService.updatePassengers(data.passengers);
    this.goToStep('payment');
  }

  onPaymentConfirmed(data: {
    gateway: PaymentGateway;
    transactionId: string;
    recieptFile: File;
  }): void {
    if (!this.savedContact() || !this.savedPassengers().length) return;

    this.isSubmitting.set(true);
    this.error.set('');

    const phone = `${this.savedContact()!.countryCode}${this.savedContact()!.whatsappNumber}`;
    const passengers = this.savedPassengers();

    const allPassengers = this.selectedSeats().map((seat) => {
      const passenger = passengers.find(p => p.seatNumber === seat);
      return {
        name: passenger?.name || '',
        age: passenger?.age || 0,
        gender: passenger?.gender || 'MALE'
      };
    });

    this.bookingService.createBooking({
      customerId: '0281279d-9ccb-47a9-add4-aa41c726b548',
      tripId: this.tripId(),
      seatNumbers: this.selectedSeats(),
      passenger: allPassengers,
      passengerContact: phone,
    }).subscribe({
      next: (bookingResponse: any) => {
        const bookingId = bookingResponse?.data?.id ?? bookingResponse?.id;

        this.bookingService.createPayment(
          {
            bookingId: bookingId,
            customerId: '0281279d-9ccb-47a9-add4-aa41c726b548',
            price: this.price(),
            totalAmount: this.price() * this.selectedSeats().length,
            companyAmount: (this.price() * this.selectedSeats().length) * 0.90,
            commissionAmount: (this.price() * this.selectedSeats().length) * 0.10,
            transactionId: data.transactionId,
            paymentMethod: data.gateway,
          },
          data.recieptFile,
        ).subscribe({
          next: (paymentResponse: any) => {
            const ticketUrl = paymentResponse?.ticket?.ticketUrl ?? '';
            this.ticketUrls.set([ticketUrl]);
            this.bookingResults.set([paymentResponse]);
            this.isSubmitting.set(false);
            this.isSuccess.set(true);
            this.sessionService.clear();
          },
          error: (err: any) => {
            this.error.set(err?.error?.message || 'حدث خطأ أثناء تأكيد الحجز');
            this.isSubmitting.set(false);
          },
        });
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'حدث خطأ أثناء إنشاء الحجز');
        this.isSubmitting.set(false);
      },
    });
  }

  onClose(): void {
    this.sessionService.clear();
    this.closed.emit();
  }
}
