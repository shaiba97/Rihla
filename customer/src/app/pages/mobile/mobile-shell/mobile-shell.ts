import { Component, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { NgClass } from '@angular/common';
import { LucideCalendarClock, LucideUser, LucideHome, LucideBell, LucideNewspaper } from '@lucide/angular';
import { filter } from 'rxjs/operators';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-mobile-shell',
  imports: [RouterOutlet, RouterLink, NgClass, LucideCalendarClock, LucideUser, LucideHome, LucideBell, LucideNewspaper],
  templateUrl: './mobile-shell.html',
})
export class MobileShell implements OnInit, OnDestroy {
  private router = inject(Router);
  private notifSvc = inject(NotificationsService);
  private authStore = inject(AuthStoreService);
  currentUrl = signal<string>(this.router.url);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.currentUrl.set((e as NavigationEnd).url);
    });
    effect(() => {
      if (this.authStore.isLoggedIn()) {
        this.notifSvc.connect();
      } else if (!this.authStore.isLoggedIn() && this.notifSvc.connected) {
        this.notifSvc.disconnect();
      }
    });
  }

  ngOnInit(): void {
    if (this.authStore.isLoggedIn()) {
      this.notifSvc.connect();
    }
  }

  ngOnDestroy(): void {
    this.notifSvc.disconnect();
  }

  isHomeActive = computed(() => this.currentUrl() === '/m/home');
  isBookingsActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/m/bookings');
  });
  isProfileActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/m/profile') || url.startsWith('/m/login') || url.startsWith('/m/register');
  });
  isNotifsActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/m/notifications');
  });
  isBlogActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/m/blogs');
  });
}
