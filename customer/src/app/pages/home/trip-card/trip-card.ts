import {
  Component, input, computed, signal,
  inject,
} from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideBus,
  LucideClock,
  LucideArmchair,
  LucideArrowLeft,
  LucideChevronLeft,
  LucideLogIn,
} from '@lucide/angular';
import { TimeFormatPipe }
  from '../../../pipes/time-format/time-format-pipe';
import { DurationPipe }
  from '../../../pipes/duration/duration-pipe';
import { BookingModalComponent }
  from '../../../shared/booking-modal/booking-modal/booking-modal';
import { BookingService } from '../../../core/services/booking/booking';
import { ArabicNumberPipe } from '../../../pipes/arabic-number/arabic-number-pipe';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';

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
    LucideLogIn,
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
  private authStore = inject(AuthStoreService);
  private router = inject(Router);

  trip     = input.required<Trip>();

  currency = 'ج. س';
  showModal = signal<boolean>(false);
  authError = signal<boolean>(false);

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
              'dark:bg-amber-950',
              'dark:text-amber-400'];
    return ['bg-[var(--primary-light)]',
            'text-[var(--primary)]',
            'dark:bg-[var(--primary)]/20',
            'dark:text-[var(--primary)]'];
  });

  bookedSeats = signal<number[]>([]);
  platformFee = signal<number>(0);

  displayPrice = computed(() => Number(this.trip().price ?? 0) + this.platformFee());

  ngOnInit(): void {
    this.getBookedSeats();
    this.getActiveFee();
  }

  openModal(): void { 
    if (!this.authStore.isLoggedIn()) {
      this.authError.set(true);
      return;
    }
    this.showModal.set(true);
  }
  closeModal(): void { this.showModal.set(false); }
  goToLogin(): void { this.router.navigate(['/login']); }

  getActiveFee(){
    this.bookingService.getActiveFee().subscribe({
      next: (res: any) => {
        const amount = Number(res?.amount ?? 0);
        this.platformFee.set(amount);
      },
      error: () => {},
    });
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