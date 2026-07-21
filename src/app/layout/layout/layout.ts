import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar';
import { AuthService } from '../../core/services/auth';
import { LucideLayoutDashboard, LucideBus, LucideRoute, LucideWallet, LucideUser, LucideSun, LucideMoon } from '@lucide/angular';
import { ThemeService } from '../../core/services/theme';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector:    'app-layout',
  imports:     [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent, TopbarComponent, LucideLayoutDashboard, LucideBus, LucideRoute, LucideWallet, LucideUser, LucideSun, LucideMoon],
  templateUrl: './layout.html',
})
export class LayoutComponent {
  sidebarOpen = signal<boolean>(false);
  toggleSidebar = () => this.sidebarOpen.update(v => !v);
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  navItems: NavItem[] = [
    { path: '/dashboard',  label: 'الرئيسية', icon: 'layout-dashboard' },
    { path: '/buses',      label: 'الحافلات', icon: 'bus' },
    { path: '/trips',      label: 'الرحلات',  icon: 'route' },
    { path: '/financials', label: 'المالية',  icon: 'wallet' },
    { path: '/profile',    label: 'الشخصية',  icon: 'user' },
  ];
}