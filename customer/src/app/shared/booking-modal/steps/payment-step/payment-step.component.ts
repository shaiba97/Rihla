import { Component, input, output, signal, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { LucideClock, LucideCreditCard, LucideCheck, LucideAlertCircle } from '@lucide/angular';
import { ArabicNumberPipe } from '../../../../pipes/arabic-number/arabic-number-pipe';

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, LucideClock, LucideCreditCard, LucideCheck, LucideAlertCircle, ArabicNumberPipe],
  templateUrl: './payment-step.component.html',
})
export class PaymentStepComponent {
  tripDetails = input.required<any>();
  selectedSeats = input<number[]>([]);
  passengers = input<any[]>([]);
  contact = input<any>(null);
  price = input<number>(0);
  currency = input<string>('جنيه');
  isSubmitting = input<boolean>(false);
  error = input<string>('');
  remainingMs = input<number>(420000);
  remainingFormatted = input<string>('٧:٠٠');
  confirmed = output<any>();

  private fb = inject(FormBuilder);

  gatewayAccounts: Record<string, string> = {
    bankak: '0912345678',
    fawry: '0923456789',
    mashriq: '0934567890',
    bravo: '0945678901',
  };

  paymentMethods = [
    { id: 'bankak', label: 'بنكك' },
    { id: 'fawry', label: 'فوري' },
    { id: 'mashriq', label: 'المصرف' },
    { id: 'bravo', label: 'برافو' },
  ];

  paymentForm = this.fb.group({
    paymentMethod: ['bankak', Validators.required],
    transactionId: ['', Validators.required],
  });

  selectedGateway = signal<string>('bankak');
  copied = signal<boolean>(false);

  gatewayAccountNumber = computed(() => this.gatewayAccounts[this.selectedGateway()]);

  totalAmount = computed(() => this.selectedSeats().length * (this.price() ?? 0));

  timerClasses = computed((): string[] => {
    const ms = this.remainingMs();
    if (ms <= 60000) return ['text-red-500', 'border-red-300', 'bg-red-50', 'animate-pulse'];
    if (ms <= 120000) return ['text-amber-500', 'border-amber-300', 'bg-amber-50'];
    return ['text-[var(--primary)]', 'border-[var(--border)]', 'bg-[var(--primary-light)]'];
  });

  canSubmit = computed(() => this.paymentForm.valid && !this.isSubmitting());

  selectGateway(gw: string): void {
    this.selectedGateway.set(gw);
    this.paymentForm.get('paymentMethod')?.setValue(gw);
  }

  async copyAccountNumber(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.gatewayAccountNumber());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {}
  }

  onSubmit(): void {
    if (!this.canSubmit()) return;
    this.confirmed.emit(this.paymentForm.value);
  }

  goBack(): void {}
}