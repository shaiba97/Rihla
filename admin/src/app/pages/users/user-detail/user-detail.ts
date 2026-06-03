import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { LucideUser, LucideArrowRight, LucideBus, LucideMapPin, LucideLoaderCircle, LucideEye, LucideDownload, LucideX } from '@lucide/angular';
import { AdminUsersService } from '../../../core/services/admin-users/admin-users.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [NgClass, DatePipe, LucideUser, LucideArrowRight, LucideBus, LucideMapPin, LucideLoaderCircle, LucideEye, LucideDownload, LucideX],
  templateUrl: './user-detail.html',
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(AdminUsersService);
  private sanitizer = inject(DomSanitizer);

  user = signal<any>(null);
  showTicketModal = signal(false);
  ticketModalUrl = signal('');
  isLoading = signal(true);
  bookingsPage = signal(1);
  bookingsPerPage = 7;

  paginatedBookings = computed(() => {
    const u = this.user();
    const all = u?.Booking ?? [];
    const start = (this.bookingsPage() - 1) * this.bookingsPerPage;
    return all.slice(start, start + this.bookingsPerPage);
  });

  bookingsTotalPages = computed(() => {
    const u = this.user();
    const all = u?.Booking ?? [];
    return Math.max(1, Math.ceil(all.length / this.bookingsPerPage));
  });

  allTrips = computed(() => {
    const u = this.user();
    if (!u?.Bus) return [];
    const trips: any[] = [];
    for (const bus of u.Bus) {
      if (bus.Trip) {
        for (const t of bus.Trip) {
          trips.push({ ...t, busName: bus.name });
        }
      }
    }
    return trips;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/users']); return; }
    this.svc.getById(id).subscribe({
      next: (res: any) => { this.user.set(res?.data ?? res); this.isLoading.set(false); console.log(res); },
      error: () => { this.isLoading.set(false); },
    });
  }

  goBack() { history.back(); }

  viewTicket(url: string | undefined): void { if (url) { this.ticketModalUrl.set(url); this.showTicketModal.set(true); } }
  downloadTicket(url: string | undefined): void { if (url) window.open(url, '_blank'); }
  closeTicketModal(): void { this.showTicketModal.set(false); this.ticketModalUrl.set(''); }
  safeUrl(url: string) { return this.sanitizer.bypassSecurityTrustResourceUrl(url); }

  genderLabel(g: string): string { return g === 'MALE' ? 'ذكر' : g === 'FEMALE' ? 'أنثى' : g; }
  methodLabel(m: string): string { return { bankak: 'بنكك', fawry: 'فوري', mashriq: 'المشرق', bravo: 'برافو' }[m] ?? m ?? '—'; }
  statusLabel(s: string): string { return { CONFIRMED: 'مؤكد', PENDING: 'قيد الانتظار', CANCELLED: 'ملغي' }[s] ?? s; }

  toArabic(n: number): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  passengers(b: any): any[] {
    const p = b?.passenger;
    if (!p) return [];
    return Array.isArray(p) ? p : [p];
  }
}
