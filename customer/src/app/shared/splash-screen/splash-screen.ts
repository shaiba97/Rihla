import { Component, output, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="splash-root"
        [class.splash-exit]="exiting()"
        aria-hidden="true"
      >
        <div class="splash-ring splash-ring--outer"></div>
        <div class="splash-ring splash-ring--inner"></div>

        <div class="splash-logo-wrap">
          <img
            src="/customerLogo.png"
            alt="تفية"
            class="splash-logo-img"
            width="100"
            height="100"
          />
        </div>

        <p class="splash-brand" lang="ar">تفية</p>
        <p class="splash-tagline" lang="ar">النقل البري في السودان</p>

        <div class="splash-dots" aria-hidden="true">
          <span class="splash-dot"></span>
          <span class="splash-dot"></span>
          <span class="splash-dot"></span>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
    .splash-root {
      position: fixed; inset: 0; z-index: 9999;
      background: #FFFFFF;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      direction: rtl;
      animation: splashFadeIn 0.3s cubic-bezier(0.25,0.1,0.25,1) both;
    }
    .splash-root.splash-exit {
      animation: splashFadeOut 0.4s cubic-bezier(0.55,0,1,0.45) both;
      pointer-events: none;
    }
    @keyframes splashFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes splashFadeOut {
      from { opacity: 1; transform: scale(1); }
      to   { opacity: 0; transform: scale(1.04); }
    }
    .splash-ring {
      position: absolute; border-radius: 50%; pointer-events: none;
    }
    .splash-ring--outer {
      width: 280px; height: 280px;
      background: rgba(13,148,136,0.04);
      animation: ringExpand 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
    }
    .splash-ring--inner {
      width: 200px; height: 200px;
      background: rgba(13,148,136,0.08);
      animation: ringExpand 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
    }
    @keyframes ringExpand {
      from { opacity: 0; transform: scale(0.7); }
      to   { opacity: 1; transform: scale(1); }
    }
    .splash-logo-wrap {
      width: 100px; height: 100px; position: relative; z-index: 1;
      animation: logoSpring 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
      margin-bottom: 28px;
      border-radius: 20px;
      overflow: hidden;
    }
    .splash-logo-img { width: 100%; height: 100%; display: block; object-fit: contain; }
    @keyframes logoSpring {
      from { opacity: 0; transform: scale(0.78); }
      to   { opacity: 1; transform: scale(1); }
    }
    .splash-brand {
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: clamp(2rem, 8vw, 2.8rem);
      font-weight: 800; color: #0D9488;
      letter-spacing: 0.02em; margin: 0 0 8px; line-height: 1;
      animation: slideUpFade 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.35s both;
    }
    .splash-tagline {
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: clamp(0.8rem, 3.5vw, 1rem);
      font-weight: 400; color: #64748B; margin: 0;
      animation: slideUpFade 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.5s both;
    }
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .splash-dots {
      position: absolute;
      bottom: max(48px, env(safe-area-inset-bottom, 48px));
      display: flex; gap: 7px; align-items: center;
    }
    .splash-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #0D9488;
      animation: dotPulse 1.2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
    }
    .splash-dot:nth-child(2) { animation-delay: 0.2s; opacity: 0.7; }
    .splash-dot:nth-child(3) { animation-delay: 0.4s; opacity: 0.45; }
    @keyframes dotPulse {
      0%, 100% { transform: scale(1);   opacity: 0.3; }
      50%       { transform: scale(1.5); opacity: 1;    }
    }
  `],
})
export class SplashScreen implements OnInit {
  readonly done = output<void>();
  visible  = signal(true);
  exiting  = signal(false);

  ngOnInit(): void {
    setTimeout(() => this.dismiss(), 2200);
  }

  dismiss(): void {
    this.exiting.set(true);
    setTimeout(() => {
      this.visible.set(false);
      this.done.emit();
    }, 420);
  }
}
