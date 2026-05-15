import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideArrowRight, LucideBus, LucideCalendar, LucideUser, LucideCreditCard, LucideDownload, LucideMapPin } from '@lucide/angular';
import { ArabicNumberPipe } from '../../../pipes/arabic-number/arabic-number-pipe';
import { TimeFormatPipe } from '../../../pipes/time-format/time-format-pipe';
import { DatePipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-booking-detail',
  imports: [LucideArrowRight, LucideBus, LucideCalendar, LucideUser, LucideCreditCard, LucideDownload, LucideMapPin, ArabicNumberPipe, TimeFormatPipe, DatePipe],
  templateUrl: './booking-detail.html',
})
export class BookingDetail {
  private router = inject(Router);


  booking = signal<any>(history.state?.booking ?? null);

  statusClass(status: string): Record<string, boolean> {
    return {
      'bg-emerald-100 text-emerald-700': status === 'confirmed' || status === 'completed' || status === 'Confirmed' || status === 'Completed',
      'bg-amber-100 text-amber-700': status === 'pending' || status === 'Pending',
      'bg-red-100 text-red-700': status === 'cancelled' || status === 'Cancelled',
    };
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { confirmed: 'مؤكد', pending: 'قيد الانتظار', cancelled: 'ملغي', completed: 'مكتمل', Pending: 'قيد الانتظار', Completed: 'مكتمل', Confirmed: 'مؤكد', Cancelled: 'ملغي' };
    return map[status] ?? status;
  }

  genderLabel(g: string): string {
    return g === 'MALE' ? 'ذكر' : g === 'FEMALE' ? 'أنثى' : g;
  }

  methodLabel(m: string): string {
    const map: Record<string, string> = { bankak: 'بنكك', fawry: 'فوري', mashriq: 'المشرق', bravo: 'برافو' };
    return map[m] ?? m;
  }

  downloadTicket(): void {
    const url = this.booking()?.TicketPDF?.ticketUrl;
    if (!url) return;
    window.location.href = `http://${window.location.hostname}:3002${url}`;
  }

  goBack(): void {
    history.back();
  }
}
