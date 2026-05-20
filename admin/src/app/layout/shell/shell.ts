import { Component, signal, inject } from '@angular/core'; import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; import { NgClass } from '@angular/common'; import { AuthService } from '../../core/services/auth/auth.service';
import { LucideLayoutDashboard, LucideUsers, LucideWallet, LucideUser, LucideSun, LucideMoon, LucideLogOut, LucideMenu, LucideX, LucideBus, LucideChevronDown } from '@lucide/angular';

@Component({
  selector: 'app-shell', standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, LucideLayoutDashboard, LucideUsers, LucideWallet, LucideUser, LucideSun, LucideMoon, LucideLogOut, LucideMenu, LucideX, LucideBus, LucideChevronDown],
  templateUrl: './shell.html',
})
export class ShellComponent {
  auth = inject(AuthService); sidebarOpen = signal(true); isDark = signal(false); showUserMenu = signal(false);
  navItems = [
    { path: '/dashboard', label: 'الرئيسية', icon: 'layout-dashboard' },
    { path: '/users', label: 'المستخدمون', icon: 'users' },
    { path: '/financial', label: 'المالية', icon: 'wallet' },
    { path: '/profile', label: 'الملف الشخصي', icon: 'user' },
  ];
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  toggleDark() { this.isDark.update(v => !v); document.documentElement.classList.toggle('dark'); }
  logout() { this.auth.logout(); }
}
