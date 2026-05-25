import { Component, computed } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { useIsMobile } from '../../shared/is-mobile';
import { Login as MobileLogin } from '../mobile/login/login';
import { Login as DesktopLogin } from '../auth/login/login';

@Component({
  selector: 'app-responsive-login',
  imports: [NgComponentOutlet],
  template: `<ng-component [ngComponentOutlet]="cmp()" />`,
})
export class ResponsiveLogin {
  isMobile = useIsMobile();
  cmp = computed(() => (this.isMobile() ? MobileLogin : DesktopLogin) as any);
}
