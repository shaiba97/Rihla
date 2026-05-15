import { Component, input, output, signal, computed } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { LucideArmchair } from '@lucide/angular';
import { ArabicNumberPipe } from '../../../../pipes/arabic-number/arabic-number-pipe';
import { TimeFormatPipe } from '../../../../pipes/time-format/time-format-pipe';

type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  number: number;
  status: SeatStatus;
}

@Component({
  selector: 'app-seat-step',
  standalone: true,
  imports: [NgClass, DatePipe, LucideArmchair, ArabicNumberPipe, TimeFormatPipe],
  templateUrl: './seat-step.component.html',
})
export class SeatStepComponent {
  tripDetails = input.required<any>();
  bookedSeats = input<number[]>([]);
  selectedSeats = output<number[]>();

  selected = signal<number[]>([]);

  seatMap = computed((): Seat[] => {
    const total = this.tripDetails()?.busChairs ?? 45;
    const booked = this.bookedSeats() ?? [];
    const sel = this.selected();
    return Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      return { 
        number: n, 
        status: booked.includes(n) ? 'booked' : sel.includes(n) ? 'selected' : 'available' 
      };
    });
  });

  mainRows = computed(() => {
    const seats = this.seatMap();
    const total = seats.length;
    const mainSeats = seats.slice(0, total - 5);
    const rows: Seat[][] = [];
    for (let i = 0; i < mainSeats.length; i += 4) {
      rows.push(mainSeats.slice(i, i + 4));
    }
    return rows;
  });

  backSeats = computed(() => this.seatMap().slice(-5));

  totalPrice = computed(() => this.selected().length * (this.tripDetails()?.price ?? 0));

  toggleSeat(seat: Seat): void {
    if (seat.status === 'booked') return;
    const cur = this.selected();
    const next = cur.includes(seat.number) 
      ? cur.filter(s => s !== seat.number) 
      : [...cur, seat.number];
    this.selected.set(next);
    this.selectedSeats.emit(next);
  }

  seatClasses(seat: Seat): string[] {
    switch (seat.status) {
      case 'selected': return ['text-[var(--primary)]', 'bg-[var(--primary-light)]'];
      case 'booked': return ['text-gray-300', 'opacity-50', 'cursor-not-allowed'];
      default: return ['text-[var(--border)]', 'hover:text-[var(--primary)]'];
    }
  }

  goBack(): void {}
}