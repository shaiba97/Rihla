import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(
    departureDate: string,
    departureTime: string,
    arrivalDate: string,
    arrivalTime: string
  ): string {
    if (!departureDate || !departureTime || !arrivalDate || !arrivalTime) {
      return '';
    }

    try {
      const departureDateTime = new Date(`${departureDate}T${departureTime}`);
      const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);

      if (isNaN(departureDateTime.getTime()) || isNaN(arrivalDateTime.getTime())) {
        return '';
      }

      const diffMs = arrivalDateTime.getTime() - departureDateTime.getTime();

      if (diffMs < 0) {
        return '';
      }

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `س${hours} د${minutes}`;
    } catch {
      return '';
    }
  }
}