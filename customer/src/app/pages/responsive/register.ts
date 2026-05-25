import { Component, computed } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { useIsMobile } from '../../shared/is-mobile';
import { Register as MobileRegister } from '../mobile/register/register';
import { Register as DesktopRegister } from '../auth/register/register';

@Component({
  selector: 'app-responsive-register',
  imports: [NgComponentOutlet],
  template: `<ng-component [ngComponentOutlet]="cmp()" />`,
})
export class ResponsiveRegister {
  isMobile = useIsMobile();
  cmp = computed(() => (this.isMobile() ? MobileRegister : DesktopRegister) as any);
}
