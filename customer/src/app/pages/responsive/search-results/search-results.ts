import { Component, computed } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { useIsMobile } from '../../../shared/is-mobile';
import { SearchResults as MobileSearchResults } from '../../mobile/search-results';
import { SearchResultsComponent as DesktopSearchResults } from '../../search-results/search-results';

@Component({
  selector: 'app-responsive-search-results',
  imports: [NgComponentOutlet],
  templateUrl: 'search-results.html',
})
export class ResponsiveSearchResults {
  isMobile = useIsMobile();
  cmp = computed(() => (this.isMobile() ? MobileSearchResults : DesktopSearchResults) as any);
}
