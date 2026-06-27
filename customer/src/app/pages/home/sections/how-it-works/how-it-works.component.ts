import { Component } from '@angular/core';
import {
  LucideSearch,
  LucideArmchair,
  LucideCreditCard,
  LucideTicket,
} from '@lucide/angular';

@Component({
  selector: 'app-how-it-works',
  imports: [
    LucideSearch,
    LucideArmchair,
    LucideCreditCard,
    LucideTicket,
  ],
  templateUrl: './how-it-works.component.html',
})
export class HowItWorksComponent {
  steps = [
    {
      icon: 'search',
      title: 'ابحث عن رحلة',
      desc: 'أدخل وجهتك وتاريخ سفرك المفضل.',
      num: '١',
    },
    {
      icon: 'armchair',
      title: 'اختر المقعد',
      desc: 'حدد مقعدك المفضل من خريطة الحافلة.',
      num: '٢',
    },
    {
      icon: 'credit-card',
      title: 'أكمل الدفع',
      desc: 'وسائل دفع آمنة وسريعة محلياً.',
      num: '٣',
    },
    {
      icon: 'ticket',
      title: 'استلم التذكرة',
      desc: 'تصلك تذكرتك الرقمية فوراً عبر التطبيق.',
      num: '٤',
    },
  ];
}
