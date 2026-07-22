import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideBus, LucideMail, LucideLock, LucideEye, LucideAlertCircle, LucideLoaderCircle, LucideLogIn } from '@lucide/angular';
import { AuthService, LoginResponse } from '../../../../core/services/auth';

@Component({
  selector:    'app-login',
  standalone:  true,
  imports:     [ReactiveFormsModule, LucideBus, LucideMail, LucideLock, LucideEye, LucideAlertCircle, LucideLoaderCircle, LucideLogIn],
  templateUrl: './login.html',
})
export class LoginComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);

  isLoading    = signal<boolean>(false);
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.value;

    this.authService.login(email!, password!).subscribe({
      next: (res: LoginResponse) => {
        if (res?.token && res?.user?.id) {
          this.authService.setSession(res.token, res.user);
          this.router.navigateByUrl('/dashboard');
        } else {
          this.errorMessage.set(res?.message || 'فشل تسجيل الدخول');
          this.isLoading.set(false);
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage.set(err?.error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        this.isLoading.set(false);
      },
    });
  }
}