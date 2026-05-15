import {
  Component, signal, inject,
  HostListener, computed,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  LucideBus,
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

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    LucideBus,
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