import { Component, computed } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { useIsMobile } from '../../shared/is-mobile';
import { Bookings as MobileBookings } from '../mobile/bookings/bookings';
import { BookingsComponent as DesktopBookings } from '../bookings/bookings';

@Component({
  selector: 'app-responsive-bookings',
  imports: [NgComponentOutlet],
  template: `<ng-component [ngComponentOutlet]="cmp()" />`,
})
export class ResponsiveBookings {
  isMobile = useIsMobile();
  cmp = computed(() => (this.isMobile() ? MobileBookings : DesktopBookings) as any);
}
