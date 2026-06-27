import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { NgClass } from '@angular/common';
import { LucideArrowRight, LucideUser, LucideSmartphone, LucideAlertCircle, LucideLogIn } from '@lucide/angular';
import { ArabicNumberPipe } from '../../pipes/arabic-number/arabic-number-pipe';
import { SessionService } from '../../services/session/session.service';
import { AuthStoreService } from '../../services/auth-store/auth-store.service';

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, ArabicNumberPipe, LucideArrowRight, LucideUser, LucideSmartphone, LucideAlertCircle, LucideLogIn],
  templateUrl: './passenger-details.html',
})
export class PassengerDetails implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private sessionSvc = inject(SessionService);
  private authStore = inject(AuthStoreService);

  trip = signal<any>(null);
  selectedSeats = signal<number[]>([]);
  baseAmount = signal<number>(0);
  platformFee = signal<number>(0);
  totalAmount = signal<number>(0);
  showLoginPrompt = signal<boolean>(false);

  countryCodes = [{ code: '+249', label: 'SD +249' }, { code: '+20', label: 'EG +20' }, { code: '+966', label: 'SA +966' }, { code: '+971', label: 'AE +971' }];

  contactGroup = this.fb.group({ countryCode: ['+249', Validators.required], whatsappNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]] });
  passengersGroup = this.fb.group({ passengers: this.fb.array([]) });
  get passengersArray(): FormArray { return this.passengersGroup.get('passengers') as FormArray; }

  private contactStatus = toSignal(this.contactGroup.statusChanges, { initialValue: 'INVALID' });
  private passengerStatus = toSignal(this.passengersGroup.statusChanges, { initialValue: 'INVALID' });
  canProceed = computed(() => this.contactStatus() === 'VALID' && this.passengerStatus() === 'VALID' && this.selectedSeats().length > 0);

  ngOnInit(): void {
    if (!this.authStore.isLoggedIn()) {
      this.showLoginPrompt.set(true);
      return;
    }
    const s = history.state;
    this.trip.set(s?.trip);
    this.selectedSeats.set(s?.selectedSeats ?? []);
    this.baseAmount.set(s?.baseAmount ?? 0);
    this.platformFee.set(s?.platformFee ?? 0);
    this.totalAmount.set(s?.totalAmount ?? 0);
    this.buildPassengerForms(this.selectedSeats());
  }

  buildPassengerForms(seats: number[]): void {
    seats.forEach(s => {
      this.passengersArray.push(this.fb.group({ seatNumber: [s], name: ['', [Validators.required, Validators.minLength(2)]], age: [null, [Validators.required, Validators.min(1), Validators.max(120)]], gender: [null, Validators.required] }));
    });
  }

  setGender(i: number, g: 'MALE' | 'FEMALE'): void { const ctrl = this.passengersArray.at(i).get('gender'); ctrl?.setValue(g); ctrl?.markAsTouched(); }
  invalid(c: AbstractControl | null): boolean { return !!c && c.invalid && c.touched; }

  async onProceed(): Promise<void> {
    this.contactGroup.markAllAsTouched();
    this.passengersGroup.markAllAsTouched();
    if (!this.canProceed()) return;
    await this.sessionSvc.updateStep('payment');
    this.router.navigate(['../payment'], { relativeTo: this.route, state: { trip: this.trip(), selectedSeats: this.selectedSeats(), baseAmount: this.baseAmount(), platformFee: this.platformFee(), totalAmount: this.totalAmount(), contact: this.contactGroup.value, passengers: this.passengersArray.value } });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  goBack(): void { history.back(); }
}
