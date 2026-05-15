import { Component, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideUser, LucideLogOut, LucideLogIn, LucidePencil, LucideCheck, LucideX, LucideAlertCircle, LucideTrash2, LucideMail, LucidePhone } from '@lucide/angular';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, LucideUser, LucideLogOut, LucideLogIn, LucidePencil, LucideCheck, LucideX, LucideAlertCircle, LucideTrash2, LucideMail, LucidePhone],
  templateUrl: './profile.html',
})
export class Profile {
  private router = inject(Router);
  authStore = inject(AuthStoreService);

  isLoggedIn = computed(() => this.authStore.isLoggedIn());
  customerName = computed(() => this.authStore.customerName());
  customerPhone = computed(() => this.authStore.customerPhone());
  customerEmail = computed(() => this.authStore.customerEmail());

  editMode = signal<boolean>(false);
  editName = signal<string>('');
  editPhone = signal<string>('');
  editEmail = signal<string>('');
  isSaving = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  showConfirmDelete = signal<boolean>(false);
  saveError = signal<string>('');
  saveSuccess = signal<string>('');
  deleteError = signal<string>('');

  login(): void {
    this.router.navigate(['/m/login']);
  }

  logout(): void {
    this.authStore.logout();
  }

  startEdit(): void {
    this.editName.set(this.customerName());
    this.editPhone.set(this.customerPhone());
    this.editEmail.set(this.customerEmail());
    this.editMode.set(true);
    this.saveError.set('');
    this.saveSuccess.set('');
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.saveError.set('');
  }

  saveProfile(): void {
    const name = this.editName().trim();
    if (!name) {
      this.saveError.set('يرجى إدخال الاسم');
      return;
    }
    const phone = this.editPhone().trim() || undefined;
    const email = this.editEmail().trim() || undefined;

    this.isSaving.set(true);
    this.saveError.set('');
    this.saveSuccess.set('');

    this.authStore.updateProfile({ name, phone, email }).subscribe({
      next: () => {
        this.authStore.updateLocalProfile({ name, phone, email });
        this.isSaving.set(false);
        this.editMode.set(false);
        this.saveSuccess.set('تم تحديث البيانات بنجاح');
        setTimeout(() => this.saveSuccess.set(''), 3000);
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message ?? 'فشل تحديث البيانات');
      },
    });
  }

  openDeleteConfirm(): void {
    this.showConfirmDelete.set(true);
    this.deleteError.set('');
  }

  cancelDelete(): void {
    this.showConfirmDelete.set(false);
    this.deleteError.set('');
  }

  confirmDelete(): void {
    this.isDeleting.set(true);
    this.deleteError.set('');
    this.authStore.deleteAccount().subscribe({
      next: () => {
        this.authStore.logout();
        this.isDeleting.set(false);
        this.showConfirmDelete.set(false);
        this.router.navigate(['/m/home']);
      },
      error: (err: any) => {
        this.isDeleting.set(false);
        this.deleteError.set(err?.error?.message ?? 'فشل حذف الحساب');
      },
    });
  }
}
