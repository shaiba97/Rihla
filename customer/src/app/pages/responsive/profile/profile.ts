import { Component, computed } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { useIsMobile } from '../../../shared/is-mobile';
import { Profile as MobileProfile } from '../../mobile/profile/profile';
import { ProfileComponent as DesktopProfile } from '../../profile/profile';

@Component({
  selector: 'app-responsive-profile',
  imports: [NgComponentOutlet],
  templateUrl: 'profile.html',
})
export class ResponsiveProfile {
  isMobile = useIsMobile();
  cmp = computed(() => (this.isMobile() ? MobileProfile : DesktopProfile) as any);
}
