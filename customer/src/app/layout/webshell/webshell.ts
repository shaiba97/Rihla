import { Component, signal, inject, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  LucideNewspaper,
  LucideHome,
  LucideCalendarClock,
  LucideBell,
  LucideUser,
} from '@lucide/angular';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';
import { CapacitorService } from '../../core/services/capacitor/capacitor.service';
import { NotificationsService } from '../../core/services/notifications/notifications.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-web-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    LucideNewspaper,
    LucideHome,
    LucideCalendarClock,
    LucideBell,
    LucideUser,
    NavbarComponent,
  ],
  templateUrl: './webshell.html',
})
export class WebShell implements OnInit, OnDestroy {
  capService = inject(CapacitorService);
  private notifSvc = inject(NotificationsService);
  authStore = inject(AuthStoreService);
  private router = inject(Router);

  currentUrl = signal<string>(this.router.url);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.currentUrl.set((e as NavigationEnd).urlAfterRedirects);
    });
    // Automatically connect notification WS when user logs in
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

  isLoggedIn = computed(() => this.authStore.isLoggedIn());

  isHomeActive = computed(() => {
    const url = this.currentUrl();
    return url === '/home' || url === '/' || url.startsWith('/search-results');
  });
  isBookingsActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/bookings');
  });
  isProfileActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/profile') || url.startsWith('/login') || url.startsWith('/register');
  });
  isNotifsActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/notifications');
  });
  isBlogActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/blogs');
  });

  unreadCount = this.notifSvc.unreadCount;

  toArabicNum(n: number): string {
    return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  goToBookings(): void {
    if (this.authStore.isLoggedIn()) {
      this.router.navigate(['/bookings']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToNotifs(): void {
    if (this.authStore.isLoggedIn()) {
      this.router.navigate(['/notifications']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToBlog(): void {
    this.router.navigate(['/blogs']);
  }
}
