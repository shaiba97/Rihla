import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideBell, LucideBellOff, LucideCheckCheck, LucideTrash2, LucideX,
  LucideSettings, LucideVolume2, LucideVolumeX, LucideCheckCircle, LucideXCircle,
  LucideAlertCircle,
} from '@lucide/angular';
import { NotificationsService, AppNotification } from '../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-notification-bell',
  imports: [
    NgClass,
    LucideBell, LucideBellOff, LucideCheckCheck, LucideTrash2, LucideX,
    LucideSettings, LucideVolume2, LucideVolumeX, LucideCheckCircle, LucideXCircle,
    LucideAlertCircle,
  ],
  templateUrl: './notification-bell.component.html',
  host: {
    '(document:click)': 'onDocClick($event)',
  },
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifSvc = inject(NotificationsService);
  router = inject(Router);

  isPanelOpen = signal<boolean>(false);
  showSettings = signal<boolean>(false);

  notifications = this.notifSvc.notifications;
  unreadCount = this.notifSvc.unreadCount;
  settings = this.notifSvc.settings;

  ngOnInit(): void {
    this.notifSvc.requestBrowserPermission();
  }

  ngOnDestroy(): void {}

  onDocClick(e: Event): void {
    const el = e.target as HTMLElement;
    if (!el.closest('.notif-panel-host')) {
      this.isPanelOpen.set(false);
      this.showSettings.set(false);
    }
  }

  togglePanel(): void {
    this.isPanelOpen.update(v => !v);
    if (this.showSettings()) this.showSettings.set(false);
  }

  toggleSettings(): void {
    this.showSettings.update(v => !v);
  }

  toggleSound(): void {
    this.notifSvc.saveSettings({ soundEnabled: !this.settings().soundEnabled });
  }

  toggleSetting(key: 'bookingAlerts' | 'paymentAlerts' | 'systemAlerts'): void {
    this.notifSvc.saveSettings({ [key]: !this.settings()[key] });
  }

  onNotifClick(n: AppNotification): void {
    this.notifSvc.markRead(n.id);
    this.isPanelOpen.set(false);
    const prefix = this.router.url.startsWith('/m') ? '/m/notifications' : '/notifications';
    this.router.navigate([prefix, n.id]);
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
