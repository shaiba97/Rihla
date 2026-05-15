import { Pipe, PipeTransform } from '@angular/core';
import { toArabicNumerals } from '../arabic-number/arabic-number.util';

@Pipe({
  name:       'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(
    departure: string | Date,
    arrival:   string | Date
  ): string {
    if (!departure || !arrival) return '--';
    
    const dep = typeof departure === 'string' && departure.includes(':') 
      ? new Date(`1970-01-01T${departure}`)
      : new Date(departure);
    const arr = typeof arrival === 'string' && arrival.includes(':')
      ? new Date(`1970-01-01T${arrival}`)
      : new Date(arrival);
      
    if (isNaN(dep.getTime()) ||
        isNaN(arr.getTime())) return '--';
    let diff = Math.abs(
      arr.getTime() - dep.getTime()
    );
    const hours   = Math.floor(diff / 3_600_000);
    const minutes = Math.floor(
      (diff % 3_600_000) / 60_000
    );
    if (hours === 0) return `${toArabicNumerals(minutes)} دقيقة`;
    if (minutes === 0) return `${toArabicNumerals(hours)} ساعة`;
    return `${toArabicNumerals(hours)}س ${toArabicNumerals(minutes)}د`;
  }
}