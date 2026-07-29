import { Component, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
})
export class ProfileComponent {
  private router = inject(Router);
  authStore = inject(AuthStoreService);

  isLoggedIn = computed(() => this.authStore.isLoggedIn());
  customerName = computed(() => this.authStore.customerName());
  customerPhone = computed(() => this.authStore.customerPhone());
  customerEmail = computed(() => this.authStore.customerEmail());

  editMode = signal(false);
  editName = signal('');
  editPhone = signal('');
  editEmail = signal('');
  isSaving = signal(false);
  saveError = signal('');
  saveSuccess = signal('');

  isDeleting = signal(false);
  showConfirmDelete = signal(false);
  deleteError = signal('');

  goToAwards() { this.router.navigate(['/m/awards']); }
  goToSettings() { this.router.navigate(['/m/profile/settings']); }
  login(): void { this.router.navigate(['/login']); }
  logout(): void { this.authStore.logout(); }

  startEdit() {
    this.editName.set(this.customerName());
    this.editPhone.set(this.customerPhone());
    this.editEmail.set(this.customerEmail());
    this.editMode.set(true);
    this.saveError.set('');
    this.saveSuccess.set('');
  }

  cancelEdit() {
    this.editMode.set(false);
    this.saveError.set('');
  }

  saveProfile() {
    const name = this.editName().trim();
    if (!name) { this.saveError.set('يرجى إدخال الاسم'); return; }
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

  openDeleteConfirm(): void { this.showConfirmDelete.set(true); this.deleteError.set(''); }
  cancelDelete(): void { this.showConfirmDelete.set(false); this.deleteError.set(''); }

  confirmDelete(): void {
    this.isDeleting.set(true);
    this.deleteError.set('');
    this.authStore.deleteAccount().subscribe({
      next: () => { this.authStore.logout(); this.isDeleting.set(false); this.showConfirmDelete.set(false); this.router.navigate(['/home']); },
      error: (err: any) => { this.isDeleting.set(false); this.deleteError.set(err?.error?.message ?? 'فشل حذف الحساب'); },
    });
  }
}
