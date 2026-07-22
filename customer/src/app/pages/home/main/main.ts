import { Component } from '@angular/core';
import { SearchHeroComponent } from '../search-hero/search-hero';
import { HowItWorksComponent } from '../sections/how-it-works/how-it-works.component';
import { WhyTafiyaComponent } from '../sections/why-tafiya/why-tafiya.component';
import { AppDownloadComponent } from '../sections/app-download/app-download.component';
import { BlogCarouselComponent } from '../sections/blog-carousel/blog-carousel.component';
import { BottomCtaComponent } from '../sections/bottom-cta/bottom-cta.component';
import { HomeFooterComponent } from '../sections/home-footer/home-footer.component';

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
export class Main {}
