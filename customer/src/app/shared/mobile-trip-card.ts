import { Component, input, output, computed, signal, inject, OnInit } from '@angular/core';
import { LucideBus, LucideCalendar, LucideClock } from '@lucide/angular';
import { TimeFormatPipe } from '../pipes/time-format/time-format-pipe';
import { DurationPipe } from '../pipes/duration/duration-pipe';
import { ArabicNumberPipe } from '../pipes/arabic-number/arabic-number-pipe';
import { formatArabicDate } from '../pipes/arabic-number/arabic-number.util';
import { BookingService } from '../services/booking/booking.service';

@Component({
  selector: 'app-mobile-trip-card',
  standalone: true,
  imports: [TimeFormatPipe, DurationPipe, ArabicNumberPipe, LucideBus, LucideCalendar, LucideClock],
  templateUrl: './mobile-trip-card.html',
})
export class MobileTripCardComponent implements OnInit {
  private bookingSvc = inject(BookingService);

  trip = input.required<any>();
  selected = output<any>();

  platformFee = signal<number>(0);
  displayPrice = computed(() => Number(this.trip()?.price ?? 0) + this.platformFee());
  bookedSeats = signal<number[]>([]);

  depDate = computed(() => formatArabicDate(this.trip()?.tripDate ?? this.trip()?.departureDate));
  arrDate = computed(() => {
    const d = this.trip()?.arrivalDate;
    return d && d !== this.trip()?.tripDate ? formatArabicDate(d) : null;
  });

  ngOnInit(): void {
    this.bookingSvc.getActiveFee().subscribe({
      next: (res: any) => this.platformFee.set(Number(res?.amount ?? 0)),
      error: () => {},
    });
    this.bookingSvc.getBookedSeats(this.trip().id).subscribe({
      next: (res: any) => {
        const seats = res?.data ?? res;
        this.bookedSeats.set(Array.isArray(seats) ? seats : []);
      },
      error: () => this.bookedSeats.set([]),
    });
  }

  onSelect(): void { this.selected.emit(this.trip()); }
}
