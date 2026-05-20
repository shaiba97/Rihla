import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterResponse } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `<div dir="rtl" class="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
    <div class="w-full max-w-md flex flex-col gap-6">
      <div class="flex flex-col items-center gap-3">
        <div class="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center">
          <span class="text-white text-3xl font-extrabold">R</span>
        </div>
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">إنشاء حساب جديد</h1>
        <p class="text-sm text-[var(--text-muted)]">رحلة — منصة حجز التذاكر</p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-[var(--text-primary)]">الاسم الكامل</label>
          <input type="text" [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="أحمد محمد"
            class="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-[var(--text-primary)]">البريد الإلكتروني</label>
          <input type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" placeholder="admin@rihla.com"
            class="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-[var(--text-primary)]">رقم الهاتف (اختياري)</label>
          <input type="tel" [ngModel]="phone()" (ngModelChange)="phone.set($event)" placeholder="0912345678"
            class="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-[var(--text-primary)]">كلمة المرور</label>
          <input type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all">
        </div>
        @if (success()) {
          <div class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{{ success() }}</div>
        }
        @if (error()) {
          <div class="px-4 py-3 rounded-xl bg-[var(--danger-light)] border border-red-200 text-sm text-[var(--danger)]">{{ error() }}</div>
        }
        <button (click)="onRegister()" [disabled]="isLoading()"
          class="w-full py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all">
          {{ isLoading() ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب' }}
        </button>
        <div class="text-center text-xs text-[var(--text-muted)]">
          لديك حساب بالفعل؟
          <a routerLink="/auth/login" class="text-[var(--primary)] font-semibold hover:underline">تسجيل الدخول</a>
        </div>
      </div>
    </div>
  </div>`,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');
  isLoading = signal(false);
  error = signal('');
  success = signal('');

  onRegister() {
    if (!this.name() || !this.password()) {
      this.error.set('يرجى تعبئة جميع الحقول الإلزامية');
      return;
    }
    if (!this.email() && !this.phone()) {
      this.error.set('يرجى إدخال البريد الإلكتروني أو رقم الهاتف');
      return;
    }
    if (this.password().length < 6) {
      this.error.set('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    this.isLoading.set(true);
    this.error.set('');
    this.success.set('');
    this.auth.register({
      name: this.name(),
      email: this.email(),
      phone: this.phone() || undefined,
      password: this.password(),
      role: 'ADMIN',
    }).subscribe({
      next: (res: RegisterResponse) => {
        this.isLoading.set(false);
        if (res.success) {
          this.success.set(res.message || 'تم إنشاء الحساب بنجاح');
          setTimeout(() => this.router.navigate(['/auth/login']), 1500);
        } else {
          this.error.set(res.message || 'فشل إنشاء الحساب');
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message || 'حدث خطأ في إنشاء الحساب');
      },
    });
  }
}
