import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreen } from './shared/splash-screen/splash-screen';
import { OnboardingScreen } from './shared/onboarding-screen/onboarding-screen';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SplashScreen, OnboardingScreen],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly splashDone = signal(false);
  protected readonly showOnboarding = signal(false);

  onSplashDone(): void {
    this.splashDone.set(true);
    const seen = localStorage.getItem('onboarding_seen');
    this.showOnboarding.set(seen !== '1');
  }
}
