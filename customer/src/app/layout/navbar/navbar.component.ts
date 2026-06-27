import {
  Component, signal, inject,
  HostListener, computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
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
  LucideX,
  LucideMenu,
} from '@lucide/angular';
import { ThemeService } from '../../core/services/theme.service';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';
import { NotificationBellComponent } from '../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
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
    LucideX,
    LucideMenu,
    NotificationBellComponent,
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  authStore = inject(AuthStoreService);

  showUserMenu = signal<boolean>(false);
  showMobileMenu = signal<boolean>(false);

  isLoggedIn = computed(() =>
    this.authStore.isLoggedIn()
  );

  userName = computed(() =>
    this.authStore.customerName() || 'المستخدم'
  );

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const t = e.target as HTMLElement;
    if (!t.closest('[data-user-menu]')) {
      this.showUserMenu.set(false);
    }
  }
}