import {
  Component, input, output, signal,
  computed, OnChanges, SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormBuilder, FormArray, FormGroup,
  ReactiveFormsModule, FormsModule,
  Validators, AbstractControl,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import {
  LucideUser,
  LucideSmartphone,
  LucideAlertCircle,
  LucideChevronLeft,
  LucideBus,
} from '@lucide/angular';
import { TimeFormatPipe }
  from '../../../../pipes/time-format/time-format-pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BookingService, TripDetails } from '../../../../core/services/booking/booking';
import { ContactForm, PassengerForm } from '../../booking-modal/booking.interfaces';

@Component({
  selector:   'app-passenger-step',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    TimeFormatPipe,
    LucideUser,
    LucideSmartphone,
    LucideAlertCircle,
    LucideChevronLeft,
    LucideBus,
  ],
  templateUrl: './passenger-step.html',
})
export class PassengerStepComponent
  implements OnChanges {

  tripDetails   = input.required<TripDetails>();
  selectedSeats = input.required<number[]>();
  price         = input.required<number>();
  currency      = input<string>('جنيه');
  initialContact = input<ContactForm | null>(null);
  initialPassengers = input<PassengerForm[]>([]);
  boookedSeats = signal<any>([]);

  nextStep  = output<{
    contact:    ContactForm;
    passengers: PassengerForm[];
  }>();

  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);

  contactGroup = this.fb.group({
    countryCode: ['', Validators.required],
    whatsappNumber: ['', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]],
  });

  passengersGroup = this.fb.group({
    passengers: this.fb.array([]),
  });

  get passengersArray(): FormArray {
    return this.passengersGroup
      .get('passengers') as FormArray;
  }

  private contactValid = toSignal(
    this.contactGroup.statusChanges.pipe(
      map(() => this.contactGroup.valid)
    ),
    { initialValue: this.contactGroup.valid }
  );

  private passengersValid = toSignal(
    this.passengersGroup.statusChanges.pipe(
      map(() => this.passengersGroup.valid)
    ),
    { initialValue: this.passengersGroup.valid }
  );

  countryCodes = [
    { code: '+249', label: 'SD +249' },
    { code: '+20',  label: 'EG +20'  },
    { code: '+966', label: 'SA +966' },
    { code: '+971', label: 'AE +971' },
    { code: '+1',   label: 'US +1'   },
    { code: '+91',   label: 'IN +91'   },
  ];

  totalPrice = computed(
    () => this.selectedSeats().length * this.price()
  );

  canProceed = computed(() =>
    this.contactValid() &&
    this.passengersValid() &&
    this.selectedSeats().length > 0
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedSeats']) {
      this.syncPassengerForms(
        this.selectedSeats()
      );
    }
  }

  ngOnInit(){
    this.getBookedSeats();
    this.restoreFormData();
  }

  restoreFormData(): void {
    // Sync seats first
    this.syncPassengerForms(this.selectedSeats());

    // Restore contact if coming back
    const contact = this.initialContact();
    if (contact) {
      this.contactGroup.patchValue({
        countryCode:    contact.countryCode,
        whatsappNumber: contact.whatsappNumber,
      });
    }

    // Restore passenger data if coming back
    const savedPassengers = this.initialPassengers();
    if (savedPassengers.length > 0) {
      savedPassengers.forEach((p, i) => {
        const ctrl = this.passengersArray.at(i);
        if (ctrl) {
          ctrl.patchValue({
            name:   p.name,
            age:    p.age,
            gender: p.gender,
          });
        }
      });
    }
  }

  syncPassengerForms(seats: number[]): void {
    const arr = this.passengersArray;
    while (arr.length > seats.length) {
      arr.removeAt(arr.length - 1);
    }
    while (arr.length < seats.length) {
      arr.push(this.fb.group({
        seatNumber: [seats[arr.length]],
        name: ['', [
          Validators.required,
          Validators.minLength(2),
        ]],
        age: [null, [
          Validators.required,
          Validators.min(1),
          Validators.max(120),
        ]],
        gender: [null, Validators.required],
      }));
    }
    seats.forEach((s, i) => {
      arr.at(i).patchValue(
        { seatNumber: s },
        { emitEvent: false }
      );
    });
  }

  setGender(
    index: number,
    value: 'MALE' | 'FEMALE'
  ): void {
    this.passengersArray
      .at(index)
      .get('gender')!
      .setValue(value);
    this.passengersArray
      .at(index)
      .get('gender')!
      .markAsTouched();
  }

  getBookedSeats(){
    this.bookingService.getBookedSeats(this.tripDetails().id).subscribe({
        next: (response: any) => {
          if(response.length){
            this.boookedSeats.set(response);
          }
        },
        error: (error: any) => {
          console.error('Error fetching selected seats:', error.error.message);
        }
    });
  }

  isFieldInvalid(
    control: AbstractControl | null
  ): boolean {
    if (!control) return false;
    return control.invalid && control.touched;
  }

  onNext(): void {
    this.contactGroup.markAllAsTouched();
    this.passengersGroup.markAllAsTouched();

    if (!this.canProceed()) return;

    const contact = this.contactGroup
      .value as ContactForm;
    const passengers = this.passengersArray
      .value as PassengerForm[];

    this.nextStep.emit({ contact, passengers });
  }
}
