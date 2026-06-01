import { Component, signal, inject, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { useIsMobile } from '../../shared/is-mobile';
import {
  LucideSun,
  LucideMoon,
  LucideUserRound,
  LucideChevronDown,
  LucideCalendarCheck,
  LucideSettings,
  LucideLogOut,
  LucideLogIn,
  LucideUserPlus,
  LucideNewspaper,
} from '@lucide/angular';
import { ThemeService } from '../../core/services/theme.service';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';
import { NotificationsService } from '../../core/services/notifications/notifications.service';
import { NotificationBellComponent } from '../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-web-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    LucideSun,
    LucideMoon,
    LucideUserRound,
    LucideChevronDown,
    LucideCalendarCheck,
    LucideSettings,
    LucideLogOut,
    LucideLogIn,
    LucideUserPlus,
    LucideNewspaper,
    NotificationBellComponent,
  ],
  templateUrl: './webshell.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class WebShell implements OnInit, OnDestroy {
  private notifSvc = inject(NotificationsService);
  themeService = inject(ThemeService);
  authStore = inject(AuthStoreService);
  private router = inject(Router);

  isMobile = useIsMobile();

  showUserMenu = signal<boolean>(false);
  showMobileMenu = signal<boolean>(false);

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
  userName = computed(() => this.authStore.customerName() || 'المستخدم');

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
    return url.startsWith('/blogs') || url.startsWith('/m/blogs');
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

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  logout(): void {
    this.showUserMenu.set(false);
    this.showMobileMenu.set(false);
    this.authStore.logout();
  }

  onDocumentClick(e: MouseEvent): void {
    const t = e.target as HTMLElement;
    if (!t.closest('[data-user-menu]')) {
      this.showUserMenu.set(false);
    }
  }
}
