import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SearchHeroComponent } from '../search-hero/search-hero';
import { HowItWorksComponent } from '../sections/how-it-works/how-it-works.component';
import { WhyTafiyaComponent } from '../sections/why-tafiya/why-tafiya.component';
import { AppDownloadComponent } from '../sections/app-download/app-download.component';
import { BlogCarouselComponent } from '../sections/blog-carousel/blog-carousel.component';
import { BottomCtaComponent } from '../sections/bottom-cta/bottom-cta.component';
import { HomeFooterComponent } from '../sections/home-footer/home-footer.component';
import { JsonLdService } from '../../../services/json-ld/json-ld.service';
import { currentPath, pageGraph } from '../../../services/json-ld/json-ld';

@Component({
  selector: 'app-main',
  imports: [
    SearchHeroComponent,
    HowItWorksComponent,
    WhyTafiyaComponent,
    AppDownloadComponent,
    BlogCarouselComponent,
    BottomCtaComponent,
    HomeFooterComponent,
  ],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main implements OnInit {
  private router = inject(Router);
  private jsonLd = inject(JsonLdService);

  ngOnInit(): void {
    this.jsonLd.set(
      'page',
      pageGraph('الرئيسية', currentPath(this.router.url), [{ name: 'الرئيسية' }]),
    );
  }
}
