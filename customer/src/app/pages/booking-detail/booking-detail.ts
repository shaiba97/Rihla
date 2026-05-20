import { Component, signal, inject } from '@angular/core';
import { Location } from '@angular/common';
import { LucideArrowRight, LucideBus, LucideCalendar, LucideUser, LucideCreditCard, LucideDownload, LucideMapPin, LucideEye } from '@lucide/angular';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';
import { TimeFormatPipe } from '../../pipes/time-format/time-format-pipe';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-booking-detail',
  imports: [LucideArrowRight, LucideBus, LucideCalendar, LucideUser, LucideCreditCard, LucideDownload, LucideMapPin, LucideEye, ArabicNumberPipe, TimeFormatPipe, DatePipe, NgClass],
  templateUrl: './booking-detail.html',
})
export class BookingDetailComponent {
  private location = inject(Location);

  booking = signal<any>(history.state?.booking ?? null);

  statusClass(status: string): Record<string, boolean> {
    const s = status?.toLowerCase();
    return {
      'bg-emerald-100 text-emerald-700': s === 'confirmed' || s === 'completed' || s === 'success',
      'bg-amber-100 text-amber-700': s === 'pending',
      'bg-red-100 text-red-700': s === 'cancelled' || s === 'failed' || s === 'refunded',
    };
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'مؤكد', pending: 'قيد الانتظار', cancelled: 'ملغي',
      completed: 'مكتمل', success: 'مدفوع', failed: 'مرفوض', refunded: 'مسترد',
    };
    return map[status?.toLowerCase()] ?? status;
  }

  tripStatusClass(status: string): Record<string, boolean> {
    const s = status?.toLowerCase();
    return {
      'bg-emerald-100 text-emerald-700': s === 'scheduled',
      'bg-amber-100 text-amber-700': s === 'pending' || s === 'delayed',
      'bg-red-100 text-red-700': s === 'cancelled',
      'bg-blue-100 text-blue-700': s === 'completed' || s === 'arrived',
    };
  }

  tripStatusLabel(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'مجدولة', pending: 'قيد الانتظار', delayed: 'متأخرة',
      cancelled: 'ملغاة', completed: 'مكتملة', arrived: 'وصلت',
    };
    return map[status?.toLowerCase()] ?? status;
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

  viewTicket(): void {
    const url = this.booking()?.TicketPDF?.ticketUrl;
    if (!url) return;
    window.open(`http://${window.location.hostname}:3002${url}`, '_blank');
  }

  goBack(): void {
    this.location.back();
  }
}
