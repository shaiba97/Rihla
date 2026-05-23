import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LucidePhone, LucideMail, LucidePlus, LucidePencil, LucideTrash2, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-support-contacts',
  standalone: true,
  imports: [FormsModule, LucidePhone, LucideMail, LucidePlus, LucidePencil, LucideTrash2, LucideX],
  template: `
    <div dir="rtl" class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">جهات الاتصال</h1>
        <button (click)="openCreate()" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] transition-all active:scale-95">
          <svg lucidePlus class="w-4 h-4"></svg>
          <span>إضافة جهة اتصال</span>
        </button>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12 text-[var(--text-muted)] text-sm">جاري التحميل...</div>
      } @else if (contacts().length === 0) {
        <div class="text-center py-12 text-[var(--text-muted)] text-sm">لا توجد جهات اتصال</div>
      } @else {
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--border)] bg-[var(--bg-base)]">
                <th class="text-right px-4 py-3 text-[var(--text-muted)] font-semibold">النوع</th>
                <th class="text-right px-4 py-3 text-[var(--text-muted)] font-semibold">القيمة</th>
                <th class="text-right px-4 py-3 text-[var(--text-muted)] font-semibold">الوصف</th>
                <th class="text-right px-4 py-3 text-[var(--text-muted)] font-semibold">الحالة</th>
                <th class="text-left px-4 py-3 text-[var(--text-muted)] font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              @for (c of contacts(); track c.id) {
                <tr class="border-b border-[var(--border)] hover:bg-[var(--bg-base)] transition-colors">
                  <td class="px-4 py-3">
                    <span class="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                      @if (c.type === 'whatsapp') {
                        <svg lucidePhone class="w-4 h-4 text-green-500"></svg>
                      } @else if (c.type === 'email') {
                        <svg lucideMail class="w-4 h-4 text-blue-500"></svg>
                      }
                      {{ c.type === 'whatsapp' ? 'واتساب' : c.type === 'email' ? 'بريد إلكتروني' : c.type }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-[var(--text-secondary)]">{{ c.value }}</td>
                  <td class="px-4 py-3 text-[var(--text-muted)]">{{ c.label || '—' }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold"
                      [class.bg-emerald-100]="c.isActive"
                      [class.text-emerald-700]="c.isActive"
                      [class.bg-red-100]="!c.isActive"
                      [class.text-red-700]="!c.isActive">
                      {{ c.isActive ? 'نشط' : 'غير نشط' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="startEdit(c)" class="p-2 rounded-lg hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all">
                        <svg lucidePencil class="w-4 h-4"></svg>
                      </button>
                      <button (click)="startDelete(c)" class="p-2 rounded-lg hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-all">
                        <svg lucideTrash2 class="w-4 h-4"></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (showForm()) {
      <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" (click)="showForm.set(false)">
        <div class="bg-[var(--bg-card)] rounded-2xl w-full max-w-md p-6 shadow-xl" (click)="\$event.stopPropagation()">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-[var(--text-primary)]">{{ editingId() ? 'تعديل جهة اتصال' : 'إضافة جهة اتصال' }}</h2>
            <button (click)="showForm.set(false)" class="p-2 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-muted)]">
              <svg lucideX class="w-5 h-5"></svg>
            </button>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-[var(--text-muted)]">النوع</label>
              <select [(ngModel)]="formType" class="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all">
                <option value="whatsapp">واتساب</option>
                <option value="email">بريد إلكتروني</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-[var(--text-muted)]">القيمة</label>
              <input [(ngModel)]="formValue" placeholder="رقم الهاتف أو البريد الإلكتروني" class="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-[var(--text-muted)]">الوصف (اختياري)</label>
              <input [(ngModel)]="formLabel" placeholder="مثال: دعم العملاء" class="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]">
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="formIsActive" id="formIsActive" class="rounded border-[var(--border)]">
              <label for="formIsActive" class="text-sm text-[var(--text-secondary)]">نشط</label>
            </div>
          </div>
          <div class="flex items-center gap-3 mt-6">
            <button (click)="save()" [disabled]="saving()" class="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] transition-all active:scale-95 disabled:opacity-40">
              @if (saving()) { جاري الحفظ... } @else { حفظ }
            </button>
            <button (click)="showForm.set(false)" class="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-bold hover:bg-[var(--bg-base)] transition-all">إلغاء</button>
          </div>
        </div>
      </div>
    }

    @if (showDelete()) {
      <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" (click)="showDelete.set(false)">
        <div class="bg-[var(--bg-card)] rounded-2xl w-full max-w-sm p-6 shadow-xl text-center" (click)="\$event.stopPropagation()">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg lucideTrash2 class="w-6 h-6 text-red-500"></svg>
          </div>
          <h2 class="text-lg font-bold text-[var(--text-primary)] mb-2">حذف جهة الاتصال؟</h2>
          <p class="text-sm text-[var(--text-muted)] mb-6">هل أنت متأكد من حذف هذه الجهة؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div class="flex gap-3">
            <button (click)="confirmDelete()" [disabled]="saving()" class="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all active:scale-95 disabled:opacity-40">
              @if (saving()) { جاري الحذف... } @else { حذف }
            </button>
            <button (click)="showDelete.set(false)" class="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-bold hover:bg-[var(--bg-base)] transition-all">إلغاء</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SupportContactsComponent implements OnInit {
  private http = inject(HttpClient);
  private api = environment.apiUrl.admin;

  contacts = signal<any[]>([]);
  isLoading = signal(true);
  showForm = signal(false);
  showDelete = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  deletingId = signal<string | null>(null);

  formType = 'whatsapp';
  formValue = '';
  formLabel = '';
  formIsActive = true;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.http.get(`${this.api}/admin/support-contacts`).subscribe({
      next: (res: any) => { this.contacts.set(res); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formType = 'whatsapp';
    this.formValue = '';
    this.formLabel = '';
    this.formIsActive = true;
    this.showForm.set(true);
  }

  startEdit(c: any): void {
    this.editingId.set(c.id);
    this.formType = c.type;
    this.formValue = c.value;
    this.formLabel = c.label || '';
    this.formIsActive = c.isActive;
    this.showForm.set(true);
  }

  startDelete(c: any): void {
    this.deletingId.set(c.id);
    this.showDelete.set(true);
  }

  save(): void {
    if (!this.formValue.trim()) return;
    this.saving.set(true);
    const body = { type: this.formType, value: this.formValue.trim(), label: this.formLabel.trim() || undefined, isActive: this.formIsActive };
    const request = this.editingId()
      ? this.http.patch(`${this.api}/admin/support-contacts/${this.editingId()}`, body)
      : this.http.post(`${this.api}/admin/support-contacts`, body);

    request.subscribe({
      next: () => { this.showForm.set(false); this.saving.set(false); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(): void {
    if (!this.deletingId()) return;
    this.saving.set(true);
    this.http.delete(`${this.api}/admin/support-contacts/${this.deletingId()}`).subscribe({
      next: () => { this.showDelete.set(false); this.saving.set(false); this.load(); },
      error: () => this.saving.set(false),
    });
  }
}
