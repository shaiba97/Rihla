import { Component, computed } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { useIsMobile } from '../../../shared/is-mobile';
import { Home as MobileHome } from '../../mobile/home';
import { Main as DesktopHome } from '../../home/main/main';

@Component({
  selector: 'app-responsive-home',
  imports: [NgComponentOutlet],
  templateUrl: 'home.html',
})
export class ResponsiveHome {
  isMobile = useIsMobile();
  cmp = computed(() => (this.isMobile() ? MobileHome : DesktopHome) as any);
}
