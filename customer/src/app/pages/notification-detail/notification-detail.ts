import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import {
  LucideBell, LucideArrowRight, LucideTrash2,
  LucideCheckCircle, LucideXCircle, LucideAlertCircle,
  LucideCalendarClock,
} from '@lucide/angular';
import { NotificationsService, AppNotification } from '../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-notification-detail',
  imports: [
    NgClass, DatePipe,
    LucideBell, LucideArrowRight, LucideTrash2,
    LucideCheckCircle, LucideXCircle, LucideAlertCircle,
    LucideCalendarClock,
  ],
  templateUrl: './notification-detail.html',
})
export class NotificationDetailPage implements OnInit {
  notifSvc = inject(NotificationsService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  notif = signal<AppNotification | null>(null);
  loading = signal(true);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;
      const list = this.notifSvc.notifications();
      const n = list.find(x => x.id === id);
      if (n) {
        this.notif.set(n);
        this.loading.set(false);
        if (!n.isRead) this.notifSvc.markRead(n.id);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/notifications']);
      return;
    }
    this.notifSvc.fetch();
  }

  deleteNotif(): void {
    const n = this.notif();
    if (!n) return;
    this.notifSvc.remove(n.id);
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/notifications']);
  }

  notifIcon(type: string): string {
    if (type === 'BOOKING_CONFIRMED') return 'check-circle';
    if (type === 'PAYMENT_REJECTED' || type === 'BOOKING_CANCELLED') return 'x-circle';
    if (type === 'BOOKING_CREATED' || type === 'PAYMENT_PENDING') return 'alert-circle';
    return 'info';
  }

  notifColor(type: string): string[] {
    if (type === 'BOOKING_CONFIRMED' || type === 'PAYMENT_CONFIRMED')
      return ['text-[var(--success)]', 'bg-[var(--success-light)]'];
    if (type === 'PAYMENT_REJECTED' || type === 'BOOKING_CANCELLED')
      return ['text-[var(--danger)]', 'bg-[var(--danger-light)]'];
    return ['text-[var(--warning)]', 'bg-[var(--warning-light)]'];
  }

  notifBg(type: string): string {
    if (type === 'BOOKING_CONFIRMED' || type === 'PAYMENT_CONFIRMED') return 'bg-[var(--success-light)]';
    if (type === 'PAYMENT_REJECTED' || type === 'BOOKING_CANCELLED') return 'bg-[var(--danger-light)]';
    return 'bg-[var(--warning-light)]';
  }

  toArabicNum(n: number): string {
    return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  timeSince(d: any): string {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 1) return 'الآن';
    const toAr = (n: number) => String(n).replace(/[0-9]/g, x => '٠١٢٣٤٥٦٧٨٩'[+x]);
    if (diff < 60) return `${toAr(diff)} دقيقة`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${toAr(h)} ساعة`;
    return `${toAr(Math.floor(h / 24))} يوم`;
  }
}
