import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';
import { JsonLdService } from '../../../services/json-ld/json-ld.service';
import { currentPath, pageGraph } from '../../../services/json-ld/json-ld';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
})
export class ProfileSettings implements OnInit {
  private router = inject(Router);
  authStore = inject(AuthStoreService);
  private jsonLd = inject(JsonLdService);

  customerName = computed(() => this.authStore.customerName());
  customerPhone = computed(() => this.authStore.customerPhone());
  customerEmail = computed(() => this.authStore.customerEmail());

  editName = signal('');
  editPhone = signal('');
  editEmail = signal('');
  editMode = signal(false);
  isSaving = signal(false);
  saveError = signal('');
  saveSuccess = signal('');

  ngOnInit(): void {
    const path = currentPath(this.router.url);
    this.jsonLd.set('page', pageGraph('الإعدادات', path, [{ name: 'حسابي', url: `${path.replace(/\/settings$/, '')}` }, { name: 'الإعدادات' }]));
  }

  back() { this.router.navigate([this.router.url.startsWith('/m/') ? '/m/profile' : '/profile']); }

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

  save() {
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
}
