import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { LucideX, LucideArrowRight, LucideCheckCircle } from '@lucide/angular';
import { BookingService } from '../../../services/booking/booking.service';
import { SessionService } from '../../../services/session/session.service';
import { SeatStepComponent } from '../steps/seat-step/seat-step.component';
import { PaymentStepComponent } from '../steps/payment-step/payment-step.component';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [LucideX, LucideArrowRight, LucideCheckCircle, SeatStepComponent, PaymentStepComponent],
  templateUrl: './booking-modal.component.html',
})
export class BookingModalComponent implements OnInit {
  private bookingSvc = inject(BookingService);
  private sessionSvc = inject(SessionService);

  tripId = input<string>('');
  ticketId = input<string>('');
  price = input<number>(0);
  currency = input<string>('جنيه');
  closed = output<void>();

  tripDetails = signal<any>(null);
  bookedSeats = signal<number[]>([]);
  selectedSeats = signal<number[]>([]);
  currentStep = signal<'seat' | 'payment'>('seat');
  isSubmitting = signal<boolean>(false);
  error = signal<string>('');
  submitSuccess = signal<boolean>(false);

  remainingMs = computed(() => this.sessionSvc.remainingMs());
  remainingFormatted = computed(() => this.sessionSvc.remainingFormatted());

  ngOnInit(): void {
    // Load trip details
    // In real app, fetch from API based on tripId
    this.tripDetails.set({
      id: this.tripId(),
      boardingCity: 'الخرطوم',
      destCity: 'ود مدني',
      tripDate: '2026-05-15',
      tripTime: '08:00',
      busChairs: 45,
      price: this.price(),
    });
    this.sessionSvc.startCountdown();
  }

  onSeatsSelected(seats: number[]): void {
    this.selectedSeats.set(seats);
    this.sessionSvc.updateSeats(seats);
    this.currentStep.set('payment');
  }

  onPaymentConfirmed(paymentData: any): void {
    this.isSubmitting.set(true);
    this.error.set('');

    this.bookingSvc.createBooking({
      tripId: this.tripId(),
      seatNumbers: this.selectedSeats(),
      passenger: [],
      passengerContact: '',
    }).subscribe({
      next: (bookingRes) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.sessionSvc.clear();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err?.error?.message ?? 'حدث خطأ');
      },
    });
  }

  close(): void {
    this.sessionSvc.clear();
    this.closed.emit();
  }
}