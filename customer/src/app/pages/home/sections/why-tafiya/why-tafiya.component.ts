import { Component } from '@angular/core';
import {
  LucideZap,
  LucideShieldCheck,
  LucideBuilding2,
  LucideHeadphones,
  LucideQrCode,
  LucideBell,
} from '@lucide/angular';

@Component({
  selector: 'app-why-tafiya',
  imports: [
    LucideZap,
    LucideShieldCheck,
    LucideBuilding2,
    LucideHeadphones,
    LucideQrCode,
    LucideBell,
  ],
  templateUrl: './why-tafiya.component.html',
})
export class WhyTafiyaComponent {
  features = [
    { icon: 'zap', title: 'حجز سريع', desc: 'احجز رحلتك في أقل من دقيقة واحدة.' },
    { icon: 'shield-check', title: 'مقاعد مضمونة', desc: 'حجزك مؤكد ١٠٠٪ فور إتمام الدفع.' },
    { icon: 'building-2', title: 'شركات موثوقة', desc: 'نتعامل مع أفضل شركات النقل الوطنية.' },
    { icon: 'headphones', title: 'دعم في', desc: 'فريقنا متاح لمساعدتك على مدار الساعة.' },
    { icon: 'qr-code', title: 'تذاكر رقمية', desc: 'وداعاً للأوراق، تذكرتك في هاتفك دائماً.' },
    { icon: 'bell', title: 'إشعارات فورية', desc: 'تنبيهات فورية بمواعيد الرحلات وأي تغييرات.' },
  ];
}
