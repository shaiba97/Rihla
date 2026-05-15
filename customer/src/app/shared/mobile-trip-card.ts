import { Component, input, output, computed } from '@angular/core';
import { LucideBus, LucideCalendar } from '@lucide/angular';
import { TimeFormatPipe } from '../pipes/time-format/time-format-pipe';
import { DurationPipe } from '../pipes/duration/duration-pipe';
import { ArabicNumberPipe } from '../pipes/arabic-number/arabic-number-pipe';
import { formatArabicDate } from '../pipes/arabic-number/arabic-number.util';

@Component({
  selector: 'app-mobile-trip-card',
  standalone: true,
  imports: [TimeFormatPipe, DurationPipe, ArabicNumberPipe, LucideBus, LucideCalendar],
  templateUrl: './mobile-trip-card.html',
})
export class MobileTripCardComponent {
  trip = input.required<any>();
  selected = output<any>();

  depDate = computed(() => formatArabicDate(this.trip()?.tripDate ?? this.trip()?.departureDate));
  arrDate = computed(() => {
    const d = this.trip()?.arrivalDate;
    return d && d !== this.trip()?.tripDate ? formatArabicDate(d) : null;
  });

  onSelect(): void { this.selected.emit(this.trip()); }
}
