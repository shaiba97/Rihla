import { Pipe, PipeTransform } from '@angular/core';
import { toArabicNumerals, formatArabicNumber } from './arabic-number.util';

@Pipe({
  name: 'arabicNumber',
})
export class ArabicNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value == null) return '';
    if (typeof value === 'number') return formatArabicNumber(value);
    if (/^\d+(\.\d+)?$/.test(value)) return formatArabicNumber(value);
    return toArabicNumerals(value);
  }
}
