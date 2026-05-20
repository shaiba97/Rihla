import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideBus, LucideMail, LucideLock, LucideUser, LucideAlertCircle, LucideLoaderCircle, LucideUserPlus } from '@lucide/angular';
import { AuthService, RegisterResponse } from '../../../core/services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideBus, LucideMail, LucideLock, LucideUser, LucideAlertCircle, LucideLoaderCircle, LucideUserPlus],
  templateUrl: './signup.html',
})
export class SignupComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);

  isLoading    = signal<boolean>(false);
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    const { name, email, password } = this.form.value;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register({
      name: name!,
      phone: email!,
      email: email!,
      password: password!,
      role: 'COMPANY',
    }).subscribe({
      next: (_res: RegisterResponse) => {
        this.router.navigate(['/auth/login']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage.set(err?.error?.message || 'حدث خطأ — يرجى المحاولة مجدداً');
        this.isLoading.set(false);
      },
    });
  }
}