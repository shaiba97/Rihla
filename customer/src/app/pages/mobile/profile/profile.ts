import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStoreService } from '../../../services/auth-store/auth-store.service';
import { JsonLdService } from '../../../services/json-ld/json-ld.service';
import { currentPath, pageGraph } from '../../../services/json-ld/json-ld';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private router = inject(Router);
  authStore = inject(AuthStoreService);
  private jsonLd = inject(JsonLdService);

  isLoggedIn = computed(() => this.authStore.isLoggedIn());
  customerName = computed(() => this.authStore.customerName());

  isDeleting = signal<boolean>(false);
  showConfirmDelete = signal<boolean>(false);
  deleteError = signal<string>('');

  ngOnInit(): void {
    this.jsonLd.set('page', pageGraph('حسابي', currentPath(this.router.url), [{ name: 'حسابي' }]));
  }

  private p = (path: string) => this.router.url.startsWith('/m/') ? `/m${path}` : path;

  goToAwards() { this.router.navigate([this.p('/awards')]); }
  goToSettings() { this.router.navigate([this.p('/profile/settings')]); }
  login(): void { this.router.navigate([this.p('/login')]); }
  logout(): void { this.authStore.logout(); }

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
