import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import {
  LucideBell, LucideCheckCheck, LucideTrash2, LucideArrowRight,
  LucideVolume2, LucideVolumeX, LucideCheckCircle, LucideXCircle,
  LucideAlertCircle,
} from '@lucide/angular';
import { NotificationsService, AppNotification } from '../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-notifications-page',
  imports: [
    NgClass, RouterLink,
  LucideBell, LucideCheckCheck, LucideTrash2, LucideArrowRight,
  LucideVolume2, LucideVolumeX, LucideCheckCircle, LucideXCircle,
    LucideAlertCircle,
  ],
  templateUrl: './notifications.html',
})
export class NotificationsPage implements OnInit, OnDestroy {
  notifSvc = inject(NotificationsService);
  router = inject(Router);

  notifications = this.notifSvc.notifications;
  unreadCount = this.notifSvc.unreadCount;
  settings = this.notifSvc.settings;

  ngOnInit(): void {
    this.notifSvc.fetch();
  }

  ngOnDestroy(): void {}

  onNotifClick(n: AppNotification): void {
    this.notifSvc.markRead(n.id);
    this.router.navigate(['/notifications', n.id]);
  }

  markAllRead(): void { this.notifSvc.markAllRead(); }

  removeNotif(e: Event, id: string): void {
    e.stopPropagation();
    this.notifSvc.remove(id);
  }

  clearAll(): void {
    if (!confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) return;
    this.notifSvc.clearAll();
  }

  toggleSound(): void {
    this.notifSvc.saveSettings({ soundEnabled: !this.settings().soundEnabled });
  }

  toggleSetting(key: 'bookingAlerts' | 'paymentAlerts' | 'systemAlerts'): void {
    this.notifSvc.saveSettings({ [key]: !this.settings()[key] });
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
