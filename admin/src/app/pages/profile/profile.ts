import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideUser, LucidePencil, LucideCheck, LucideX, LucideTrash2, LucideMail, LucidePhone, LucideLogOut } from '@lucide/angular';
import { AuthService, UpdateProfileResponse, DeleteAccountResponse } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, LucideUser, LucidePencil, LucideCheck, LucideX, LucideTrash2, LucideMail, LucidePhone, LucideLogOut,],
  templateUrl: './profile.html',
})
export class ProfileComponent {
  private router = inject(Router);
  auth = inject(AuthService);

  editMode = signal(false);
  editName = signal('');
  editEmail = signal('');
  editPhone = signal('');
  isSaving = signal(false);
  isDeleting = signal(false);
  showConfirmDelete = signal(false);
  saveError = signal('');
  saveSuccess = signal('');
  deleteError = signal('');

  startEdit(): void {
    this.editName.set(this.auth.currentUser()?.name ?? '');
    this.editEmail.set(this.auth.userEmail);
    this.editPhone.set(this.auth.userPhone);
    this.editMode.set(true);
    this.saveError.set(''); this.saveSuccess.set('');
  }

  cancelEdit(): void { this.editMode.set(false); this.saveError.set(''); }

  saveProfile(): void {
    const name = this.editName().trim();
    if (!name) { this.saveError.set('يرجى إدخال الاسم'); return; }
    this.isSaving.set(true); this.saveError.set(''); this.saveSuccess.set('');
    const email = this.editEmail().trim() || undefined;
    const phone = this.editPhone().trim() || undefined;
    this.auth.updateProfile({ name, email, phone }).subscribe({
      next: (_res: UpdateProfileResponse) => {
        this.auth.updateLocalProfile({ name, email, phone });
        this.isSaving.set(false); this.editMode.set(false);
        this.saveSuccess.set('تم تحديث البيانات بنجاح');
        setTimeout(() => this.saveSuccess.set(''), 3000);
      },
      error: (err: any) => { this.isSaving.set(false); this.saveError.set(err?.error?.message ?? 'فشل تحديث البيانات'); },
    });
  }

  openDeleteConfirm(): void { this.showConfirmDelete.set(true); this.deleteError.set(''); }
  cancelDelete(): void { this.showConfirmDelete.set(false); this.deleteError.set(''); }

  confirmDelete(): void {
    this.isDeleting.set(true); this.deleteError.set('');
    this.auth.deleteAccount().subscribe({
      next: (_res: DeleteAccountResponse) => { this.auth.logout(); },
      error: (err: any) => { this.isDeleting.set(false); this.deleteError.set(err?.error?.message ?? 'فشل حذف الحساب'); },
    });
  }

  logout(): void { this.auth.logout(); }
}
