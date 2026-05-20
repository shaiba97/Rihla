import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideBus, LucidePhone, LucideLock, LucideLogIn } from '@lucide/angular';
import { AuthStoreService, LoginResponse } from '../../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, LucideBus, LucidePhone, LucideLock, LucideLogIn],
  templateUrl: './login.html',
})
export class Login {
  private router = inject(Router);
  private authStore = inject(AuthStoreService);

  identifier = signal<string>('');
  password = signal<string>('');
  error = signal<string>('');
  isLoading = signal<boolean>(false);

  submit(): void {
    const id = this.identifier().trim();
    const pw = this.password().trim();
    if (!id) {
      this.error.set('يرجى إدخال رقم الهاتف أو البريد الإلكتروني');
      return;
    }
    if (!pw) {
      this.error.set('يرجى إدخال كلمة المرور');
      return;
    }
    this.error.set('');
    this.isLoading.set(true);
    const isEmail = id.includes('@');
    this.authStore.login({ phone: isEmail ? undefined : id, email: isEmail ? id : undefined, password: pw }).subscribe({
      next: (res: LoginResponse) => {
        const token = res.token;
        const user = res.user;
        if (!token || !user) {
          this.error.set('فشل تسجيل الدخول');
          this.isLoading.set(false);
          return;
        }
        this.authStore.setSession(token, user);
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'بيانات الدخول غير صحيحة');
        this.isLoading.set(false);
      },
    });
  }
}
