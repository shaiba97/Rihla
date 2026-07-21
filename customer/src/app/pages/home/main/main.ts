import { Component } from '@angular/core';
import { TripListComponent } from '../trip-list/trip-list';
import { SearchHeroComponent } from '../search-hero/search-hero';

@Component({
  selector: 'app-main',
  imports: [TripListComponent, SearchHeroComponent],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {}
