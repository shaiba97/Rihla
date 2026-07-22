import { Component, output, inject, computed, signal, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { LucideLayoutDashboard, LucideBus, LucideRoute, LucideTicket, LucideCalendar, LucideWallet, LucideUser, LucideBell, LucideBellOff, LucideSun, LucideMoon, LucideLogOut, LucideMenu, LucideChevronDown } from '@lucide/angular';
import { ThemeService } from '../../core/services/theme';
import { AuthService } from '../../core/services/auth';

@Component({
  selector:    'app-topbar',
  standalone:  true,
  imports:     [LucideLayoutDashboard, LucideBus, LucideRoute, LucideTicket, LucideCalendar, LucideWallet, LucideUser, LucideBell, LucideBellOff, LucideSun, LucideMoon, LucideLogOut, LucideMenu, LucideChevronDown],
  templateUrl: './topbar.html',
})
export class TopbarComponent {
  toggleSidebar  = output<void>();
  themeService   = inject(ThemeService);
  authService    = inject(AuthService);
  private router = inject(Router);

  showNotifications = signal<boolean>(false);
  showUserMenu      = signal<boolean>(false);
  unreadCount       = signal<number>(0);

  private pageMap: Record<string, { title: string }> = {
    '/dashboard':  { title: 'الرئيسية' },
    '/buses':      { title: 'الحافلات' },
    '/trips':      { title: 'الرحلات' },
    '/tickets':    { title: 'التذاكر' },
    '/bookings':   { title: 'الحجوزات' },
    '/financials': { title: 'التقارير المالية' },
    '/profile':    { title: 'الملف الشخصي' },
  };

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  currentPageTitle = computed(() => {
    const url = this.currentUrl() ?? '/dashboard';
    const key = Object.keys(this.pageMap).find(k => url.startsWith(k)) ?? '/dashboard';
    return this.pageMap[key].title;
  });

  currentPageKey = computed(() => {
    const url = this.currentUrl() ?? '/dashboard';
    return Object.keys(this.pageMap).find(k => url.startsWith(k)) ?? '/dashboard';
  });

  companyName = computed(() => this.authService.companyName());

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const t = e.target as HTMLElement;
    if (!t.closest('[data-dropdown]')) {
      this.showNotifications.set(false);
      this.showUserMenu.set(false);
    }
  }
}