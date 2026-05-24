import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { NgClass } from '@angular/common';
import { LucideCalendarClock, LucideUser, LucideHome, LucideBell } from '@lucide/angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-mobile-shell',
  imports: [RouterOutlet, RouterLink, NgClass, LucideCalendarClock, LucideUser, LucideHome, LucideBell],
  templateUrl: './mobile-shell.html',
})
export class MobileShell {
  private router = inject(Router);
  currentUrl = signal<string>(this.router.url);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.currentUrl.set((e as NavigationEnd).url);
    });
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
}
