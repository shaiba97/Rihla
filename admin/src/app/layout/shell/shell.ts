import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core'; import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; import { NgClass } from '@angular/common'; import { AuthService } from '../../core/services/auth/auth.service';
import { LucideLayoutDashboard, LucideUsers, LucideWallet, LucideUser, LucideSun, LucideMoon, LucideLogOut, LucideMenu, LucideX, LucideBus, LucideChevronDown, LucidePhone } from '@lucide/angular';
import { NotificationBellComponent } from '../../shared/notification-bell/notification-bell.component';
import { NotificationsService } from '../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-shell', standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, LucideLayoutDashboard, LucideUsers, LucideWallet, LucideUser, LucideSun, LucideMoon, LucideLogOut, LucideMenu, LucideX, LucideBus, LucideChevronDown, LucidePhone, NotificationBellComponent],
  templateUrl: './shell.html',
})
export class ShellComponent implements OnInit, OnDestroy {
  auth = inject(AuthService); sidebarOpen = signal(true); isDark = signal(false); showUserMenu = signal(false);
  private notifSvc = inject(NotificationsService);

  ngOnInit(): void {
    this.notifSvc.connect();
  }

  ngOnDestroy(): void {
    this.notifSvc.disconnect();
  }
  navItems = [
    { path: '/dashboard', label: 'الرئيسية', icon: 'layout-dashboard' },
    { path: '/users', label: 'المستخدمون', icon: 'users' },
    { path: '/financial', label: 'المالية', icon: 'wallet' },
    { path: '/support-contacts', label: 'جهات الاتصال', icon: 'phone' },
    { path: '/profile', label: 'الملف الشخصي', icon: 'user' },
  ];
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  toggleDark() { this.isDark.update(v => !v); document.documentElement.classList.toggle('dark'); }
  logout() { this.auth.logout(); }
}
