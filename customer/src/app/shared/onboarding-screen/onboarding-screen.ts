import { Component, output, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-onboarding-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="onboard-root" role="dialog" aria-label="شاشة الترحيب">
      <button class="onboard-skip" type="button" (click)="finish()" aria-label="تخطي">تخطي</button>

      <div class="slide" [style.animation]="'slideIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both'">
        @switch (step()) {
          @case (0) {
            <div class="onboard-graphic">
              <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="onboard-svg" role="img" aria-label="اختر وجهتك">
                <rect x="20" y="80" width="160" height="60" rx="8" fill="#CCFBF1"/>
                <rect x="30" y="90" width="40" height="20" rx="4" fill="#5EEAD4"/>
                <rect x="80" y="90" width="40" height="20" rx="4" fill="#5EEAD4"/>
                <rect x="130" y="90" width="40" height="20" rx="4" fill="#5EEAD4"/>
                <circle cx="100" cy="30" r="24" fill="#0D9488"/>
                <circle cx="100" cy="30" r="10" fill="#FFFFFF"/>
                <path d="M100 54 L100 120" stroke="#0D9488" stroke-width="4" stroke-linecap="round"/>
                <circle cx="100" cy="130" r="6" fill="#134E4A"/>
              </svg>
            </div>
            <h2 class="onboard-title">اختر وجهتك</h2>
            <p class="onboard-text">ابحث عن رحلتك المثالية من بين العديد من الوجهات في جميع أنحاء السودان</p>
          }
          @case (1) {
            <div class="onboard-graphic">
              <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="onboard-svg" role="img" aria-label="احجز مقعدك">
                <rect x="30" y="50" width="140" height="80" rx="12" fill="#CCFBF1"/>
                <rect x="45" y="65" width="22" height="22" rx="4" fill="#5EEAD4"/>
                <rect x="75" y="65" width="22" height="22" rx="4" fill="#0D9488"/>
                <rect x="105" y="65" width="22" height="22" rx="4" fill="#5EEAD4"/>
                <rect x="135" y="65" width="22" height="22" rx="4" fill="#5EEAD4"/>
                <rect x="45" y="95" width="22" height="22" rx="4" fill="#5EEAD4"/>
                <rect x="75" y="95" width="22" height="22" rx="4" fill="#5EEAD4"/>
                <rect x="105" y="95" width="22" height="22" rx="4" fill="#5EEAD4"/>
                <rect x="135" y="95" width="22" height="22" rx="4" fill="#5EEAD4"/>
                <circle cx="100" cy="142" r="10" fill="#0D9488" opacity="0.3"/>
                <circle cx="100" cy="142" r="5" fill="#0D9488"/>
              </svg>
            </div>
            <h2 class="onboard-title">احجز مقعدك</h2>
            <p class="onboard-text">اختر مقعدك المفضل واستمتع برحلة مريحة مع خدماتنا المتميزة</p>
          }
          @case (2) {
            <div class="onboard-graphic">
              <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="onboard-svg" role="img" aria-label="انطلق مع تفية">
                <rect x="25" y="70" width="150" height="50" rx="10" fill="#CCFBF1"/>
                <rect x="35" y="80" width="30" height="10" rx="3" fill="#5EEAD4"/>
                <rect x="75" y="80" width="30" height="10" rx="3" fill="#5EEAD4"/>
                <rect x="115" y="80" width="30" height="10" rx="3" fill="#5EEAD4"/>
                <circle cx="55" cy="130" r="10" fill="#0D9488"/>
                <circle cx="145" cy="130" r="10" fill="#0D9488"/>
                <path d="M130 50 L140 60 L160 50" stroke="#0D9488" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <path d="M160 50 L160 40" stroke="#0D9488" stroke-width="3" stroke-linecap="round"/>
                <circle cx="170" cy="46" r="4" fill="#134E4A"/>
              </svg>
            </div>
            <h2 class="onboard-title">انطلق مع تفية</h2>
            <p class="onboard-text">استمتع برحلتك مع تتبع مباشر وتحديثات فورية طوال الطريق</p>
          }
        }
      </div>

      <div class="onboard-dots" aria-hidden="true">
        @for (dot of [0,1,2]; track dot) {
          <span class="onboard-dot" [class.onboard-dot--active]="step() === dot"></span>
        }
      </div>

      <button class="onboard-btn" type="button" (click)="next()">
        @if (step() < 2) {
          التالي
        } @else {
          ابدأ الآن
        }
      </button>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .onboard-root {
      position: fixed; inset: 0; z-index: 9998;
      background: #F0FDFA;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      direction: rtl;
      padding: 24px;
      animation: overlayIn 0.35s cubic-bezier(0.25,0.1,0.25,1) both;
    }
    @keyframes overlayIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .onboard-skip {
      position: absolute; top: 16px; left: 20px;
      background: none; border: none;
      font-family: inherit; font-size: 14px;
      color: #0F766E; cursor: pointer;
      padding: 8px 4px; z-index: 1;
      -webkit-tap-highlight-color: transparent;
    }
    .slide {
      display: flex; flex-direction: column;
      align-items: center; gap: 16px;
      max-width: 320px; width: 100%;
    }
    .onboard-graphic {
      width: 100%; max-width: 220px;
      margin-bottom: 8px;
    }
    .onboard-svg { width: 100%; height: auto; display: block; }
    .onboard-title {
      font-size: 22px; font-weight: 800;
      color: #134E4A; margin: 0;
      text-align: center; line-height: 1.3;
    }
    .onboard-text {
      font-size: 14px; font-weight: 400;
      color: #0F766E; margin: 0;
      text-align: center; line-height: 1.7;
      max-width: 280px;
    }
    .onboard-dots {
      display: flex; gap: 8px;
      margin: 32px 0 24px;
      height: 10px;
      align-items: center;
    }
    .onboard-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #CCFBF1;
      transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    .onboard-dot--active {
      width: 28px; border-radius: 4px;
      background: #0D9488;
    }
    .onboard-btn {
      width: 100%; max-width: 320px;
      padding: 14px 24px;
      border: none; border-radius: 12px;
      background: #0D9488; color: #FFFFFF;
      font-family: inherit; font-size: 16px;
      font-weight: 700; cursor: pointer;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
      -webkit-tap-highlight-color: transparent;
    }
    .onboard-btn:active {
      transform: scale(0.97);
    }
  `],
})
export class OnboardingScreen {
  readonly done = output<void>();
  step = signal(0);

  next(): void {
    if (this.step() < 2) {
      this.step.update(s => s + 1);
    } else {
      this.finish();
    }
  }

  finish(): void {
    localStorage.setItem('onboarding_seen', '1');
    this.done.emit();
  }
}
