import { Component, signal, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideSearch, LucideTrash2, LucideAlertCircle, LucideChevronLeft, LucideChevronRight, LucideUsers, LucideLoaderCircle, LucidePen, LucideX, LucideUserPlus } from '@lucide/angular';
import { AdminUsersService } from '../../core/services/admin-users/admin-users.service';
import { BusesService } from '../../core/services/buses/buses-service';
import { Trips } from '../../core/services/trips/trips';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgClass, FormsModule, LucideSearch, LucideTrash2, LucideAlertCircle, LucideChevronLeft, LucideChevronRight, LucideUsers, LucideLoaderCircle, LucidePen, LucideX, LucideUserPlus],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private svc = inject(AdminUsersService);
  private busSvc = inject(BusesService);
  private tripSvc = inject(Trips);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  users = signal<any[]>([]);
  total = signal(0);
  pages = signal(0);
  page = signal(1);
  search = signal('');
  roleFilter = signal('USER');
  isLoading = signal(false);
  error = signal('');
  deleteId = signal<string | null>(null);
  deleteName = signal('');

  showModal = signal(false);
  editMode = signal(false);
  editId = signal<string | null>(null);
  saving = signal(false);
  formError = signal('');
  formName = signal('');
  formEmail = signal('');
  formPhone = signal('');
  formPassword = signal('');
  formRole = signal('USER');

  roles = [
    { value: 'USER', label: 'مستخدم' },
    { value: 'ADMIN', label: 'مشرف' },
    { value: 'COMPANY', label: 'شركة' },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const r = params['role'];
      const p = params['page'];
      if (r && ['USER', 'ADMIN', 'COMPANY'].includes(r)) this.roleFilter.set(r);
      if (p) this.page.set(Number(p));
      this.load();
    });
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.svc.getAll({ page: this.page(), limit: 20, search: this.search() || undefined, role: this.roleFilter() || undefined }).subscribe({
      next: (res: any) => {
        const d = res?.data ?? res;
        let users = d.users ?? [];
        this.total.set(d.total ?? 0);
        this.pages.set(d.pages ?? 0);
        if (this.roleFilter() === 'COMPANY' && users.length > 0) {
          Promise.all([
            this.busSvc.getBuses().toPromise(),
            this.tripSvc.getTrips().toPromise(),
          ]).then(([buses, trips]) => {
            const busesArr = (buses as any[]) ?? [];
            const tripsArr = (trips as any[]) ?? [];
            users = users.map((u: any) => {
              const companyBuses = busesArr.filter((b: any) => b.companyId === u.id);
              const busCount = companyBuses.length;
              const tripCount = tripsArr.filter((t: any) => companyBuses.some((b: any) => b.id === t.busId)).length;
              return { ...u, _count: { ...u._count, Bus: busCount, Trip: tripCount } };
            });
            this.users.set(users);
            this.isLoading.set(false);
          }).catch(() => { this.users.set(users); this.isLoading.set(false); });
        } else {
          this.users.set(users);
          this.isLoading.set(false);
        }
      },
      error: (err: any) => { this.error.set(err?.message || 'فشل تحميل البيانات'); this.isLoading.set(false); },
    });
  }

  onSearch(val: string): void { this.search.set(val); this.page.set(1); this.load(); }
  setRole(r: string): void {
    this.roleFilter.set(r);
    this.page.set(1);
    this.router.navigate([], { queryParams: { role: r, page: 1 }, queryParamsHandling: 'merge', replaceUrl: true });
    this.load();
  }
  goPage(p: number): void {
    if (p >= 1 && p <= this.pages()) {
      this.page.set(p);
      this.router.navigate([], { queryParams: { page: p }, queryParamsHandling: 'merge', replaceUrl: true });
      this.load();
    }
  }

  goToUser(id: string): void { this.router.navigate(['/users', id]); }

  confirmDelete(id: string, name: string): void { this.deleteId.set(id); this.deleteName.set(name); }
  cancelDelete(): void { this.deleteId.set(null); this.deleteName.set(''); }

  deleteUser(): void {
    const id = this.deleteId();
    if (!id) return;
    this.svc.remove(id).subscribe({ next: () => { this.cancelDelete(); this.load(); }, error: () => {} });
  }

  openCreate(): void {
    this.editMode.set(false);
    this.editId.set(null);
    this.formName.set('');
    this.formEmail.set('');
    this.formPhone.set('');
    this.formPassword.set('');
    this.formRole.set('USER');
    this.formError.set('');
    this.showModal.set(true);
  }

  openEdit(user: any): void {
    this.editMode.set(true);
    this.editId.set(user.id);
    this.formName.set(user.name || '');
    this.formEmail.set(user.email || '');
    this.formPhone.set(user.phone || '');
    this.formPassword.set('');
    this.formRole.set(user.role || 'USER');
    this.formError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveUser(): void {
    this.formError.set('');
    if (!this.formName().trim()) {
      this.formError.set('الاسم مطلوب');
      return;
    }
    if (!this.editMode() && !this.formPassword().trim()) {
      this.formError.set('كلمة المرور مطلوبة');
      return;
    }

    this.saving.set(true);
    if (this.editMode()) {
      const payload: any = { name: this.formName().trim() };
      if (this.formEmail().trim()) payload.email = this.formEmail().trim();
      if (this.formPhone().trim()) payload.phone = this.formPhone().trim();
      if (this.formPassword().trim()) payload.password = this.formPassword().trim();
      payload.role = this.formRole();
      this.svc.update(this.editId()!, payload).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.load(); },
        error: (err: any) => { this.saving.set(false); this.formError.set(err?.error?.message || err?.message || 'فشل التحديث'); },
      });
    } else {
      const payload: any = { name: this.formName().trim(), password: this.formPassword().trim(), role: this.formRole() };
      if (this.formEmail().trim()) payload.email = this.formEmail().trim();
      if (this.formPhone().trim()) payload.phone = this.formPhone().trim();
      this.svc.create(payload).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.load(); },
        error: (err: any) => { this.saving.set(false); this.formError.set(err?.error?.message || err?.message || 'فشل الإنشاء'); },
      });
    }
  }

  roleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      COMPANY: 'bg-purple-100 text-purple-700',
      USER: 'bg-blue-100 text-blue-700',
      ADMIN: 'bg-amber-100 text-amber-700',
    };
    return map[role] || 'bg-gray-100 text-gray-700';
  }

  roleLabel(r: string): string {
    return { COMPANY: 'شركة', USER: 'مستخدم', ADMIN: 'مشرف' }[r] ?? r;
  }

  toArabic(n: number): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }

  getVisiblePages(): number[] {
    const total = this.pages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
