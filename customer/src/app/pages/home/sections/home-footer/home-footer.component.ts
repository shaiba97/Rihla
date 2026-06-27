import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home-footer',
  imports: [RouterLink],
  templateUrl: './home-footer.component.html',
})
export class HomeFooterComponent {
  currentYear = new Date().getFullYear();

  supportLinks = [
    { label: 'الأسئلة الشائعة', path: '/faq' },
    { label: 'تواصل معنا', path: '/contact' },
    { label: 'مركز المساعدة', path: '/help' },
    { label: 'سياسة الاسترداد', path: '/refund' },
  ];
}
