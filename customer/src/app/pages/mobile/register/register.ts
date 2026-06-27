import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideArrowRight, LucideLock, LucideUser, LucideUserPlus, LucidePhone } from '@lucide/angular';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, LucideArrowRight, LucideLock, LucideUser, LucideUserPlus, LucidePhone],
  templateUrl: './register.html',
})
export class Register {
  private router = inject(Router);
  private authStore = inject(AuthStoreService);

  name = signal<string>('');
  identifier = signal<string>('');
  password = signal<string>('');
  agreedToTerms = signal<boolean>(false);
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
    if (!this.agreedToTerms()) {
      this.error.set('يجب الموافقة على الشروط والأحكام وسياسة الخصوصية');
      return;
    }
    this.error.set('');
    this.isLoading.set(true);
    const isEmail = id.includes('@');
    const phone = isEmail ? undefined : id;
    const email = isEmail ? id : undefined;
    this.authStore.register({ name: n, phone, email, password: pw }).pipe(
      switchMap(() => this.authStore.login({ phone, email: id, password: pw })),
    ).subscribe({
      next: (res: any) => {
        const token = res?.token;
        const user = res?.user;
        if (token && user) {
          this.authStore.setSession(token, user);
        }
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const msg = err?.error?.message;
        if (msg) {
          this.error.set(msg);
        } else {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  goBack(): void {
    history.back();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
