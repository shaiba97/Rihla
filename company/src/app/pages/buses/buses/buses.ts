import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideBus, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { BusService } from '../../../core/services/bus';

interface Bus {
  id: string;
  name: string;
  chairs: number;
  seatStartFrom: 'LEFT' | 'RIGHT';
  plate: { arabic?: string; english?: string; numbers?: string } | string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-buses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideBus, LucidePencil, LucideTrash2],
  templateUrl: './buses.html',
})
export class BusesComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3001/api';

  buses = signal<Bus[]>([]);
  showForm = signal(false);
  showModal = signal(false);
  editingBus = signal<Bus | null>(null);
  loading = signal(false);

  formData = signal<{
    name: string;
    chairs: number;
    seatStartFrom: 'LEFT' | 'RIGHT';
    plate: { arabic: string; english: string; numbers: string };
  }>({
    name: '',
    chairs: 0,
    seatStartFrom: 'RIGHT',
    plate: {
      arabic: '',
      english: '',
      numbers: '',
    },
  });

  constructor(private busService: BusService) {
    this.loadBuses();
  }


  loadBuses() {
    this.busService.getBuses().subscribe({
      next: (buses: Bus[]) => this.buses.set(buses),
      error: () => {},
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  }

  openCreateForm() {
    this.editingBus.set(null);
    this.formData.set({
      name: '',
      chairs: 0,
      seatStartFrom: 'RIGHT',
      plate: {
        arabic: '',
        english: '',
        numbers: '',
      },
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.formData.set({
      name: '',
      chairs: 0,
      seatStartFrom: 'RIGHT',
      plate: {
        arabic: '',
        english: '',
        numbers: '',
      },
    });
  }

  openEditForm(bus: Bus) {
    this.editingBus.set(bus);
    const plate = typeof bus.plate === 'string' ? { arabic: bus.plate, english: '', numbers: '' } : bus.plate || { arabic: '', english: '', numbers: '' };
    this.formData.set({
      name: bus.name,
      chairs: bus.chairs,
      seatStartFrom: bus.seatStartFrom,
      plate: {
        arabic: plate.arabic || '',
        english: plate.english || '',
        numbers: plate.numbers || '',
      },
    });
    this.showModal.set(true);
  }

  submitForm() {
    const data = this.formData();
    if (!data.name || !data.chairs) return;

    this.loading.set(true);

    const submitData = {
      name: data.name,
      chairs: data.chairs,
      seatStartFrom: data.seatStartFrom,
      plate: {
        arabic: data.plate.arabic,
        english: data.plate.english,
        numbers: data.plate.numbers,
      },
    };

    const request = this.editingBus()
      ? this.busService.updateBus(this.editingBus()!.id, submitData)
      : this.busService.createBus(submitData);

    request.subscribe({
      next: () => {
        this.loadBuses();
        this.closeModal();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  removeBusItem(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الحاقية؟')) return;

    this.busService.deleteBus(id).subscribe({
      next: () => {
        const currentBuses = this.buses();
        this.buses.set(currentBuses.filter(b => b.id !== id));
      },
      error: () => {},
    });
  }

  goToBusDetails(busId: string) {
    this.router.navigate(['/buses/bus', busId]);
  }
}