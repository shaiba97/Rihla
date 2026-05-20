import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideBus, LucideLock, LucideUser, LucideUserPlus, LucidePhone } from '@lucide/angular';
import { AuthStoreService, LoginResponse, CreateUserResponse } from '../../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, LucideBus, LucideLock, LucideUser, LucideUserPlus, LucidePhone],
  templateUrl: './register.html',
})
export class Register {
  private router = inject(Router);
  private authStore = inject(AuthStoreService);

  name = signal<string>('');
  identifier = signal<string>('');
  password = signal<string>('');
  error = signal<string>('');
  isLoading = signal<boolean>(false);

  submit(): void {
    const n = this.name().trim();
    const id = this.identifier().trim();
    const pw = this.password().trim();
    if (!n) {
      this.error.set('يرجى إدخال الاسم');
      return;
    }
    if (!id) {
      this.error.set('يرجى إدخال رقم الهاتف أو البريد الإلكتروني');
      return;
    }
    if (!pw || pw.length < 6) {
      this.error.set('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    this.error.set('');
    this.isLoading.set(true);
    const isEmail = id.includes('@');
    const phone = isEmail ? undefined : id;
    const email = isEmail ? id : undefined;
    this.authStore.register({ name: n, phone, email, password: pw }).subscribe({
      next: () => {
        this.authStore.login({ phone, email, password: pw }).subscribe({
          next: (res: LoginResponse) => {
            const token = res.token;
            const user = res.user;
            if (token && user) {
              this.authStore.setSession(token, user);
            }
            this.isLoading.set(false);
            this.router.navigate(['/home']);
          },
          error: () => {
            this.isLoading.set(false);
            this.router.navigate(['/login']);
          },
        });
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'فشل إنشاء الحساب');
        this.isLoading.set(false);
      },
    });
  }
}
