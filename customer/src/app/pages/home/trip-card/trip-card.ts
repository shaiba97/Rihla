import {
  Component, input, output, computed, signal,
  inject,
} from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import {
  LucideBus,
  LucideClock,
  LucideArmchair,
  LucideArrowLeft,
  LucideChevronLeft,
} from '@lucide/angular';
import { TimeFormatPipe }
  from '../../../pipes/time-format/time-format-pipe';
import { DurationPipe }
  from '../../../pipes/duration/duration-pipe';
import { BookingModalComponent }
  from '../../../shared/booking-modal/booking-modal/booking-modal';
import { BookingService } from '../../../core/services/booking/booking';
import { ArabicNumberPipe } from '../../../pipes/arabic-number/arabic-number-pipe';

export interface Trip {
  id: string;
  ticketId?: string;
  busId: string;
  fromState: string;
  toState: string;
  fromCity: string;
  fromStation: string;
  toCity: string;
  toStation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
  currency?: string;
  status: string;
  bus: {
    id: string;
    name: string;
    chairs: number;
    seatStartFrom: string;
    plate: {
      arabic: string;
      english: string;
      numbers: string;
    };
  };
  bookings: Booking[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  passengerName: string;
  passengerAge: number;
  passengerGender: string;
  seatNumber: number;
  status: string;
}

@Component({
  selector:   'app-trip-card',
  standalone: true,
  imports: [
    NgClass,
    LucideBus,
    LucideClock,
    LucideArmchair,
    LucideArrowLeft,
    LucideChevronLeft,
    TimeFormatPipe,
    DurationPipe,
    DatePipe,
    ArabicNumberPipe,
    BookingModalComponent,
  ],
  templateUrl: './trip-card.html',
})
export class TripCardComponent {

  private bookingService = inject(BookingService);

  trip     = input.required<Trip>();
  selected = output<Trip>();

  currency = 'ج. س';
  showModal = signal<boolean>(false);

  seatsClasses = computed((): string[] => {
    const s = this.trip().bus!.chairs;
    if (s <= 5)
      return ['bg-red-50',
              'text-red-600',
              'dark:bg-red-950',
              'dark:text-red-400'];
    if (s <= 10)
      return ['bg-amber-50',
              'text-amber-600',
              'dark:bg-red-950',
              'dark:text-amber-400'];
    return ['bg-emerald-50',
            'text-emerald-700',
            'dark:bg-red-950',
            'dark:text-emerald-400'];
  });

  bookedSeats = signal<number[]>([]);

  ngOnInit(): void {
    this.getBookedSeats();
  }

  openModal(): void { 
    this.showModal.set(true);
  }
  closeModal(): void { this.showModal.set(false); }

  onSelect(): void {
    this.selected.emit(this.trip());
  }

  getBookedSeats(){

    this.bookingService.getBookedSeats(this.trip().id).subscribe({
        next: (response: any) => {
          this.bookedSeats.set(response);
        },
        error: (error: any) => {
          console.error('Error fetching selected seats:', error.error.message);
        }
    });

  }
}