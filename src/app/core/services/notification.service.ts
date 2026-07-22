import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  findAll(limit = 30) {
    return this.http.get<{ notifications: NotificationItem[]; unreadCount: number }>(`${environment.apiUrl.company}/notifications?limit=${limit}`);
  }

  getUnreadCount() {
    return this.http.get<{ count: number }>(`${environment.apiUrl.company}/notifications/unread-count`);
  }

  markRead(id: string) {
    return this.http.patch(`${environment.apiUrl.company}/notifications/${id}/read`, {});
  }

  markAllRead() {
    return this.http.patch(`${environment.apiUrl.company}/notifications/read-all`, {});
  }
}
