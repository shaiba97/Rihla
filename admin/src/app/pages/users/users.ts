import { Component, signal, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideSearch, LucideTrash2, LucideAlertCircle, LucideChevronLeft, LucideChevronRight, LucideUsers, LucideLoaderCircle } from '@lucide/angular';
import { AdminUsersService } from '../../core/services/admin-users/admin-users.service';
import { BusesService } from '../../core/services/buses/buses-service';
import { Trips } from '../../core/services/trips/trips';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgClass, FormsModule, LucideSearch, LucideTrash2, LucideAlertCircle, LucideChevronLeft, LucideChevronRight, LucideUsers, LucideLoaderCircle],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private svc = inject(AdminUsersService);
  private busSvc = inject(BusesService);
  private tripSvc = inject(Trips);
  private router = inject(Router);

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

  ngOnInit() { this.load(); }

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
  setRole(r: string): void { this.roleFilter.set(r); this.page.set(1); this.load(); }
  goPage(p: number): void { if (p >= 1 && p <= this.pages()) { this.page.set(p); this.load(); } }

  goToUser(id: string): void { this.router.navigate(['/users', id]); }

  confirmDelete(id: string, name: string): void { this.deleteId.set(id); this.deleteName.set(name); }
  cancelDelete(): void { this.deleteId.set(null); this.deleteName.set(''); }

  deleteUser(): void {
    const id = this.deleteId();
    if (!id) return;
    this.svc.remove(id).subscribe({ next: () => { this.cancelDelete(); this.load(); }, error: () => {} });
  }

  roleBadgeClass(role: string): string {
    return role === 'COMPANY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  }

  roleLabel(r: string): string {
    return { COMPANY: 'شركة', USER: 'مستخدم' }[r] ?? r;
  }

  toArabic(n: number): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
}
