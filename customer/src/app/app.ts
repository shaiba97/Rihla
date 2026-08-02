import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SplashScreen } from './shared/splash-screen/splash-screen';
import { OnboardingScreen } from './shared/onboarding-screen/onboarding-screen';
import { OfflineScreen } from './shared/offline-screen/offline-screen';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SplashScreen, OnboardingScreen, OfflineScreen],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly splashDone = signal(isPlatformServer(inject(PLATFORM_ID)));
  protected readonly showOnboarding = signal(false);

  onSplashDone(): void {
    this.splashDone.set(true);
    const seen = localStorage.getItem('onboarding_seen');
    this.showOnboarding.set(seen !== '1');
  }
}
