import {
  Component, input, output, computed,
  inject, signal
} from '@angular/core';
import { NgClass } from '@angular/common';
import {
  LucideArmchair,
  LucideBus,
  LucideCalendar,
  LucideChevronLeft,
  LucideCircle,
  LucideClock,
} from '@lucide/angular';
import { TimeFormatPipe } from '../../../../pipes/time-format/time-format-pipe';
import { DatePipe } from '@angular/common';
import { SeatMap } from '../../booking-modal/booking.interfaces';
import { BookingService, TripDetails } from '../../../../core/services/booking/booking';

@Component({
  selector:   'app-seat-step',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    TimeFormatPipe,
    LucideArmchair,
    LucideBus,
    LucideCalendar,
    LucideChevronLeft,
    LucideCircle,
    LucideClock,
  ],
  templateUrl: './seat-step.html',
})
export class SeatStepComponent {

  private bookingService = inject(BookingService);

  tripDetails    = input.required<TripDetails>();
  seatMap        = input.required<SeatMap[]>();
  selectedSeats  = input.required<number[]>();
  price          = input.required<number>();
  currency       = input<string>('جنيه');
  heldSeats      = input<number[]>([]);
  remainingMs    = input<number>(420000);
  remainingFormatted = input<string>('7:00');

  seatToggled    = output<SeatMap>();
  nextStep       = output<void>();

  canProceed = computed(
    () => this.selectedSeats().length > 0 &&
          this.remainingMs() > 0
  );
  totalPrice = computed(() => this.selectedSeats().length * this.price());

  selectedSeat = signal<any>({});
  boookedSeats = signal<any>([]);

  busRows = computed(() => {
    const seats = this.seatMap();
    const trip  = this.tripDetails();
    if (!seats.length || !trip) return null;
    const total     = trip.Bus?.chairs || 45;
    const backCount = 5;
    const mainSeats = seats.slice(0, total - backCount);
    const backSeats = seats.slice(total - backCount);
    const left  =  2;
    const right =  2;
    const perRow = left + right;
    const rows: SeatMap[][] = [];
    for (let i = 0; i < mainSeats.length; i += perRow) {
      rows.push(mainSeats.slice(i, i + perRow));
    }
    return { rows, backSeats, left, right };
  });

  timerColor = computed((): string[] => {
    const ms = this.remainingMs();
    if (ms <= 60_000)
      return ['text-red-500', 'font-extrabold', 'animate-pulse'];
    if (ms <= 120_000)
      return ['text-amber-500', 'font-bold'];
    return ['text-[var(--primary)]', 'font-bold'];
  });

  ngOnInit(): void {
    this.getSelectedSats();
    this.getBookedSeats();
  }

  getSelectedSats(){
      this.bookingService.getBooking('tripId', this.tripDetails().id).subscribe({
      next: (response: any) => {
        this.selectedSeat.set(response);
      },
      error: (error: any) => {
        console.error('Error fetching selected seats:', error.error.message);
      }
    });
  }

  seatClasses(seat: SeatMap): string[] {
    switch (seat.status) {
      case 'reserved':
        return [
          'text-[var(--primary)]',
          'drop-shadow-md',
          'scale-110',
          'cursor-pointer',
          'transition-all',
          'duration-150',
        ];
      case 'booked':
        return [
          'text-red-400',
          'opacity-70',
          'cursor-not-allowed',
        ];
      case 'held':
        return [
          'text-amber-400',
          'opacity-70',
          'cursor-not-allowed',
        ];
      default:
        return [
          'text-[var(--border)]',
          'hover:text-[var(--primary)]',
          'hover:scale-110',
          'cursor-pointer',
          'transition-all',
          'duration-150',
        ];
    }
  }

  seatIconColor(seat: SeatMap): string {
    switch (seat.status) {
      case 'reserved': return 'var(--primary)';
      case 'booked':   return '#f87171';
      case 'held':     return '#fbbf24';
      default:         return 'currentColor';
    }
  }

  onSeatClick(seat: SeatMap): void {
    if (seat.status === 'booked' ||
        seat.status === 'held') return;
    this.seatToggled.emit(seat);
  }

  onNext(): void {
    if (!this.canProceed()) return;
    this.nextStep.emit();
  }

  getBookedSeats(){
    this.bookingService.getBookedSeats(this.tripDetails().id).subscribe({
        next: (response: any) => {
          if(response.length){
            this.boookedSeats.set(response);
          }
        },
        error: (error: any) => {
          console.error('Error fetching selected seats:', error.error.message);
        }
    });
  }
}
