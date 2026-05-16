import { Pipe, PipeTransform } from '@angular/core';
import { toArabicNumerals, formatArabicPrice } from './arabic-number.util';

@Pipe({ name: 'arabicNumber' })
export class ArabicNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined, format?: 'price'): string {
    if (value == null) return '';
    if (format === 'price') return formatArabicPrice(value);
    return toArabicNumerals(value);
  }
}
