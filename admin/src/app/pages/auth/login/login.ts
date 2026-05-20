import { Component, inject, signal } from '@angular/core'; import { Router, RouterLink } from '@angular/router'; import { FormsModule } from '@angular/forms'; import { AuthService, LoginResponse } from '../../../core/services/auth/auth.service';
@Component({
  selector: 'app-login', imports: [FormsModule, RouterLink],
  template: `<div dir="rtl" class="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
    <div class="w-full max-w-md flex flex-col gap-6">
      <div class="flex flex-col items-center gap-3"><div class="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center"><span class="text-white text-3xl font-extrabold">R</span></div><h1 class="text-2xl font-extrabold text-[var(--text-primary)]">لوحة الإدارة</h1><p class="text-sm text-[var(--text-muted)]">رحلة — منصة حجز التذاكر</p></div>
      <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5"><label class="text-sm font-semibold text-[var(--text-primary)]">البريد الإلكتروني أو رقم الهاتف</label>
          <input type="text" [ngModel]="identifier()" (ngModelChange)="identifier.set($event)" placeholder="admin@rihla.com" class="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all"></div>
        <div class="flex flex-col gap-1.5"><label class="text-sm font-semibold text-[var(--text-primary)]">كلمة المرور</label>
          <input type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all"></div>
        @if (error()) { <div class="px-4 py-3 rounded-xl bg-[var(--danger-light)] border border-red-200 text-sm text-[var(--danger)]">{{ error() }}</div> }
        <button (click)="onLogin()" [disabled]="isLoading()" class="w-full py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all">{{ isLoading() ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول' }}</button>
        <div class="text-center text-xs text-[var(--text-muted)]">ليس لديك حساب؟
          <a routerLink="/auth/register" class="text-[var(--primary)] font-semibold hover:underline">إنشاء حساب جديد</a>
        </div>
      </div>
    </div>
  </div>`
})
export class LoginComponent {
  private auth = inject(AuthService); private router = inject(Router);
  identifier = signal(''); password = signal(''); isLoading = signal(false); error = signal('');
  onLogin() {
    if (!this.identifier() || !this.password()) { this.error.set('يرجى تعبئة جميع الحقول'); return; }
    this.isLoading.set(true); this.error.set('');
    this.auth.login(this.identifier(), this.password()).subscribe({
      next: (res: LoginResponse) => { if (res?.token && res?.user) { this.auth.setSession(res.token, res.user); this.router.navigate(['/dashboard']); } else { this.error.set(res?.message || 'فشل تسجيل الدخول'); this.isLoading.set(false); }},
      error: (err: any) => {
        console.error('Login error:', err);
        if (err.status === 0) {
          this.error.set('تعذر الاتصال بالخادم — تأكد من تشغيل الخادم');
        } else {
          this.error.set(err?.error?.message || 'بيانات الدخول غير صحيحة');
        }
        this.isLoading.set(false);
      },
    });
  }
}
