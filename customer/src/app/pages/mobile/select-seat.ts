import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { LucideArrowRight, LucideArmchair } from '@lucide/angular';
import { BookingService } from '../../services/booking/booking.service';
import { SessionService } from '../../services/session/session.service';
import { TimeFormatPipe } from '../../pipes/time-format/time-format-pipe';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';

type SeatStatus = 'available' | 'reserved' | 'booked';
interface Seat { number: number; status: SeatStatus; }

@Component({
  selector: 'app-select-seat',
  standalone: true,
  imports: [NgClass, DatePipe, TimeFormatPipe, ArabicNumberPipe, LucideArrowRight, LucideArmchair],
  templateUrl: './select-seat.html',
})
export class SelectSeat implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingSvc = inject(BookingService);
  private sessionSvc = inject(SessionService);

  trip = signal<any>(null);
  bookedSeats = signal<number[]>([]);
  selectedSeats = signal<number[]>([]);
  isLoading = signal<boolean>(true);
  platformFee = signal<number>(0);

  platformFeeAmount = computed(() => this.platformFee());
  baseAmount = computed(() => this.platformFeeAmount() + (this.trip()?.price ?? 0));

  totalAmount = computed(() => this.selectedSeats().length * this.baseAmount());

  seatMap = computed((): Seat[] => {
    const total = this.trip()?.busChairs ?? 45;
    const booked = this.bookedSeats();
    const sel = this.selectedSeats();
    return Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      return { number: n, status: booked.includes(n) ? 'booked' : sel.includes(n) ? 'reserved' : 'available' };
    });
  });

  mainRows = computed(() => {
    const seats = this.seatMap();
    const total = seats.length;
    const mainSeats = seats.slice(0, total - 5);
    const rows: Seat[][] = [];
    for (let i = 0; i < mainSeats.length; i += 4) rows.push(mainSeats.slice(i, i + 4));
    return rows;
  });

  backSeats = computed(() => this.seatMap().slice(-5));

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId') ?? '';
    const nav = history.state?.trip;
    if (nav) this.trip.set(nav);
    this.bookingSvc.getActiveFee().subscribe(fee => {
      if (fee) this.platformFee.set(Number(fee.amount));
    });
    this.bookingSvc.getBookedSeats(tripId).subscribe({
      next: r => { this.bookedSeats.set(r.data ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  toggleSeat(seat: Seat): void {
    if (seat.status === 'booked') return;
    const cur = this.selectedSeats();
    const next = cur.includes(seat.number) ? cur.filter(s => s !== seat.number) : [...cur, seat.number];
    this.selectedSeats.set(next);
    if (next.length > 0) this.sessionSvc.startCountdown();
    this.sessionSvc.updateSeats(next);
  }

  seatColor(seat: Seat): string[] {
    switch (seat.status) {
      case 'reserved': return ['text-[var(--primary)]','scale-110'];
      case 'booked': return ['text-red-400','opacity-60','cursor-not-allowed'];
      default: return ['text-[var(--border)]','hover:text-[var(--primary)]','active:scale-110'];
    }
  }

  onNext(): void {
    if (!this.selectedSeats().length) return;
    this.router.navigate(['/m/passenger'], {
      state: {
        trip: this.trip(),
        selectedSeats: this.selectedSeats(),
        baseAmount: this.baseAmount(),
        platformFee: this.platformFeeAmount(),
        totalAmount: this.totalAmount(),
      },
    });
  }
  goBack(): void { history.back(); }
}
