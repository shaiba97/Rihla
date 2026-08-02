import { Component, inject, OnInit } from '@angular/core';
import { Location, NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { LucideArrowRight, LucideChevronRight } from '@lucide/angular';
import { useIsMobile } from '../../shared/is-mobile';
import { JsonLdService } from '../../services/json-ld/json-ld.service';
import { breadcrumbList, currentPath, webPage } from '../../services/json-ld/json-ld';

@Component({
  selector: 'app-terms',
  imports: [NgTemplateOutlet, LucideArrowRight, LucideChevronRight],
  templateUrl: './terms.html',
})
export class TermsPage implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private jsonLd = inject(JsonLdService);
  isMobile = useIsMobile();

  ngOnInit(): void {
    const page = webPage('الشروط والأحكام وسياسة الخصوصية', currentPath(this.router.url), 'الشروط والأحكام وسياسة الخصوصية لتفية');
    page['dateModified'] = '2026-01-01';
    this.jsonLd.set('page', [page, breadcrumbList([{ name: 'الشروط والأحكام وسياسة الخصوصية' }])]);
  }

  goBack(): void {
    this.location.back();
  }
}
