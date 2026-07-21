import { Component, input, output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideLayoutDashboard, LucideBus, LucideRoute, LucideWallet, LucideUser, LucideSun, LucideMoon, LucideLogOut, LucideX } from '@lucide/angular';
import { ThemeService } from '../../core/services/theme';
import { AuthService } from '../../core/services/auth';

interface NavItem {
  path:  string;
  label: string;
}

@Component({
  selector:    'app-sidebar',
  standalone:  true,
  imports:     [RouterLink, RouterLinkActive, LucideLayoutDashboard, LucideBus, LucideRoute, LucideWallet, LucideUser, LucideSun, LucideMoon, LucideLogOut, LucideX],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  isOpen       = input<boolean>(false);
  closeSidebar = output<void>();
  themeService = inject(ThemeService);
  authService  = inject(AuthService);

  navItems: NavItem[] = [
    { path: '/dashboard',  label: 'الرئيسية' },
    { path: '/buses',      label: 'الحافلات' },
    { path: '/trips',      label: 'الرحلات' },
    { path: '/financials', label: 'المالية' },
    { path: '/profile',   label: 'الشخصية' },
  ];
}