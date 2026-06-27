import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

@Injectable({ providedIn: 'root' })
export class CapacitorService {
  isNative = signal(Capacitor.isNativePlatform());

  constructor() {
    if (this.isNative()) {
      this.init();
    }
  }

  private init(): void {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#0D9488' });

    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        history.back();
      } else {
        App.exitApp();
      }
    });
  }
}
