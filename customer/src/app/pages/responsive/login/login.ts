import { Component, computed } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { useIsMobile } from '../../../shared/is-mobile';
import { Login as MobileLogin } from '../../mobile/login/login';
import { Login as DesktopLogin } from '../../auth/login/login';

@Component({
  selector: 'app-responsive-login',
  imports: [NgComponentOutlet],
  templateUrl: 'login.html',
})
export class ResponsiveLogin {
  isMobile = useIsMobile();
  cmp = computed(() => (this.isMobile() ? MobileLogin : DesktopLogin) as any);
}
