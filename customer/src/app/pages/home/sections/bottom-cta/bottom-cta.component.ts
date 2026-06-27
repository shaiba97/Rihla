import { Component } from '@angular/core';

@Component({
  selector: 'app-bottom-cta',
  templateUrl: './bottom-cta.component.html',
})
export class BottomCtaComponent {
  scrollToSearch(): void {
    const el = document.getElementById('search-hero');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
