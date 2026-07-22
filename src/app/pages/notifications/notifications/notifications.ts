import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBell, LucideBellOff, LucideLoaderCircle, LucideAlertCircle, LucideRefreshCw, LucideArrowLeft, LucideCheck, LucideCheckCheck } from '@lucide/angular';
import { NotificationService, NotificationItem } from '../../../core/services/notification.service';
import { WsService } from '../../../core/services/ws.service';
import { toArabicNumerals, formatArabicDate } from '../../../pipes/arabic-number/arabic-number.util';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterLink, LucideBell, LucideBellOff, LucideLoaderCircle, LucideAlertCircle, LucideRefreshCw, LucideArrowLeft, LucideCheck, LucideCheckCheck],
  templateUrl: './notifications.html',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private svc = inject(NotificationService);
  private ws = inject(WsService);
  private wsCleanups: (() => void)[] = [];

  notifications = signal<NotificationItem[]>([]);
  isLoading = signal(true);
  error = signal('');
  unreadCount = signal(0);

  ngOnInit() {
    this.load();
    this.wsCleanups.push(this.ws.on('notification:new', () => this.load()));
  }

  ngOnDestroy() { this.wsCleanups.forEach(fn => fn()); }

  load() {
    this.isLoading.set(true);
    this.svc.findAll().subscribe({
      next: r => {
        this.notifications.set(r.notifications);
        this.unreadCount.set(r.unreadCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('حدث خطأ أثناء تحميل الإشعارات');
        this.isLoading.set(false);
      },
    });
  }

  markRead(id: string) {
    this.svc.markRead(id).subscribe(() => {
      this.notifications.update(list =>
        list.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      this.unreadCount.update(c => Math.max(0, c - 1));
    });
  }

  markAllRead() {
    this.svc.markAllRead().subscribe(() => this.load());
  }

  toArabic = (n: number | string) => toArabicNumerals(n);
  fmtDate = (d: string) => formatArabicDate(d);
}
