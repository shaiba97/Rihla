import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(false);

  constructor() {
    const saved      = localStorage.getItem('tafiya_theme');
    const prefersDark =
      window.matchMedia('(prefers-color-scheme: dark)')
            .matches;
    const initial = saved ? saved === 'dark' : prefersDark;
    this.isDark.set(initial);
    this.applyTheme(initial);
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.applyTheme(next);
    localStorage.setItem(
      'tafiya_theme', next ? 'dark' : 'light'
    );
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList
            .toggle('dark', dark);
  }
}