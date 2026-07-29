import { Component, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
})
export class ProfileSettings {
  private router = inject(Router);
  authStore = inject(AuthStoreService);

  customerName = computed(() => this.authStore.customerName());
  customerPhone = computed(() => this.authStore.customerPhone());
  customerEmail = computed(() => this.authStore.customerEmail());

  editMode = signal(false);
  editName = signal('');
  isSaving = signal(false);
  saveError = signal('');
  saveSuccess = signal('');

  back() { this.router.navigate([this.router.url.startsWith('/m/') ? '/m/profile' : '/profile']); }

  startEdit() {
    this.editName.set(this.customerName());
    this.editMode.set(true);
    this.saveError.set('');
    this.saveSuccess.set('');
  }

  cancelEdit() {
    this.editMode.set(false);
    this.saveError.set('');
  }

  save() {
    const name = this.editName().trim();
    if (!name) { this.saveError.set('يرجى إدخال الاسم'); return; }
    this.isSaving.set(true);
    this.saveError.set('');
    this.saveSuccess.set('');
    this.authStore.updateProfile({ name }).subscribe({
      next: () => {
        this.authStore.updateLocalProfile({ name });
        this.isSaving.set(false);
        this.editMode.set(false);
        this.saveSuccess.set('تم التحديث بنجاح');
        setTimeout(() => this.saveSuccess.set(''), 3000);
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message ?? 'فشل التحديث');
      },
    });
  }
}
