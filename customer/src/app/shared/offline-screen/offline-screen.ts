import { Component, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-offline-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (offline()) {
      <div class="offline-root" role="alert" aria-label="لا يوجد اتصال بالإنترنت">
        <div class="offline-graphic">
          <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="offline-svg" role="img" aria-label="الإنترنت مفصول">
            <rect x="25" y="45" width="50" height="70" rx="10" fill="#CCFBF1"/>
            <rect x="38" y="60" width="24" height="8" rx="3" fill="#5EEAD4"/>
            <rect x="38" y="90" width="24" height="8" rx="3" fill="#5EEAD4"/>
            <rect x="125" y="45" width="50" height="70" rx="10" fill="#0D9488" opacity="0.9"/>
            <path d="M25 80 L10 80" stroke="#0D9488" stroke-width="4" stroke-linecap="round"/>
            <path d="M175 80 L190 80" stroke="#0D9488" stroke-width="4" stroke-linecap="round"/>
            <path d="M78 52 L102 108" stroke="#134E4A" stroke-width="3" stroke-linecap="round"/>
            <path d="M102 52 L78 108" stroke="#134E4A" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <h2 class="offline-title">لا يوجد اتصال</h2>
        <p class="offline-text">يرجى التحقق من اتصالك بالإنترنت</p>
        <button class="offline-btn" type="button" (click)="retry()">إعادة المحاولة</button>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
    .offline-root {
      position: fixed; inset: 0; z-index: 9997;
      background: #F0FDFA;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      direction: rtl;
      padding: 24px;
      animation: fadeIn 0.3s cubic-bezier(0.25,0.1,0.25,1) both;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .offline-graphic {
      width: 100%; max-width: 180px;
      margin-bottom: 24px;
    }
    .offline-svg { width: 100%; height: auto; display: block; }
    .offline-title {
      font-size: 22px; font-weight: 800;
      color: #134E4A; margin: 0 0 8px;
      text-align: center; line-height: 1.3;
    }
    .offline-text {
      font-size: 14px; font-weight: 400;
      color: #0F766E; margin: 0 0 28px;
      text-align: center; line-height: 1.6;
    }
    .offline-btn {
      width: 100%; max-width: 280px;
      padding: 14px 24px;
      border: none; border-radius: 12px;
      background: #0D9488; color: #FFFFFF;
      font-family: inherit; font-size: 16px;
      font-weight: 700; cursor: pointer;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
      -webkit-tap-highlight-color: transparent;
    }
    .offline-btn:active {
      transform: scale(0.97);
    }
  `],
})
export class OfflineScreen implements OnDestroy {
  offline = signal(typeof navigator === 'undefined' ? false : !navigator.onLine);

  private onOnline = () => this.offline.set(false);
  private onOffline = () => this.offline.set(true);

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }

  retry(): void {
    if (typeof window !== 'undefined') window.location.reload();
  }
}
