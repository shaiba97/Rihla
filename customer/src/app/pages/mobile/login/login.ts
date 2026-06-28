import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideArrowRight, LucidePhone, LucideLock, LucideLogIn } from '@lucide/angular';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, LucideArrowRight, LucidePhone, LucideLock, LucideLogIn],
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
    this.authStore.login({ email: id, password: pw }).subscribe({
      next: (res: any) => {
        const token = res?.token;
        const user = res?.user;
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

  goBack(): void {
    history.back();
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
