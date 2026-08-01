import { Component, input, model, signal, computed, inject, ElementRef, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-city-select',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .active-option { background-color: var(--primary-light); }
  `],
  template: `
    <div class="relative w-full" dir="rtl">
      <input
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="listboxId"
        [attr.aria-activedescendant]="activeId()"
        [attr.autocomplete]="'off'"
        [ngModel]="displayText()"
        (ngModelChange)="onInput($event)"
        (focus)="open()"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
        [placeholder]="placeholder()"
        class="w-full bg-transparent border-none outline-none text-sm font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:font-normal">
      @if (isOpen() && filteredCities().length > 0) {
        <div
          [id]="listboxId"
          role="listbox"
          class="fixed z-50 bg-[var(--bg-card)] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(19,78,74,0.12),0_14px_36px_rgba(19,78,74,0.18)]"
          [style.width.px]="dropdownWidth()"
          [style.top.px]="dropdownTop()"
          [style.left.px]="dropdownLeft()">
          <div class="max-h-56 overflow-y-auto py-1">
            @for (city of filteredCities(); track city; let i = $index) {
              <button
                type="button"
                role="option"
                [id]="optionId(i)"
                [attr.aria-selected]="activeIndex() === i"
                [class.active-option]="activeIndex() === i"
                (mousedown)="handleClick(city, $event)"
                (touchstart)="handleClick(city, $event)"
                (mouseenter)="activeIndex.set(i)"
                class="w-full text-right px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--primary-light)] transition-colors duration-100 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-secondary)]" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span class="flex-1 truncate">{{ city }}</span>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class CitySelectComponent {
  private el = inject(ElementRef);
  private destroyRef = inject(DestroyRef);
  private uid = 'c' + Math.random().toString(36).slice(2, 8);

  placeholder = input('');

  value = model<string>('');

  allCities = input<string[]>([]);

  searchTerm = signal('');
  isOpen = signal(false);
  activeIndex = signal(-1);
  dropdownTop = signal(0);
  dropdownLeft = signal(0);
  dropdownWidth = signal(0);

  get listboxId(): string {
    return `city-list-${this.uid}`;
  }

  displayText = computed(() => this.value() || this.searchTerm());

  filteredCities = computed(() => {
    const term = this.searchTerm().trim();
    if (!term) return this.allCities();
    return this.allCities().filter(c => c.includes(term));
  });

  activeId = computed(() => {
    const i = this.activeIndex();
    return i >= 0 ? this.optionId(i) : '';
  });

  private readonly onScroll = () => this.updatePosition();
  private readonly onResize = () => this.updatePosition();

  constructor() {
    this.destroyRef.onDestroy(() => this.detach());
  }

  open(): void {
    this.updatePosition();
    this.attach();
    this.isOpen.set(true);
  }

  close(): void {
    setTimeout(() => {
      this.isOpen.set(false);
      this.activeIndex.set(-1);
      this.detach();
    }, 150);
  }

  onBlur(): void {
    const term = this.searchTerm().trim();
    if (term && !this.value()) {
      const match = this.allCities().find(c => c === term);
      if (match) this.value.set(match);
    }
    this.close();
  }

  onInput(value: string): void {
    this.searchTerm.set(value);
    this.activeIndex.set(-1);
    if (!this.isOpen()) {
      this.updatePosition();
      this.attach();
      this.isOpen.set(true);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const list = this.filteredCities();
    if (!list.length) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => (i + 1) % list.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => (i - 1 + list.length) % list.length);
        break;
      case 'Enter':
        if (this.isOpen() && this.activeIndex() >= 0) {
          event.preventDefault();
          this.select(list[this.activeIndex()]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        this.activeIndex.set(-1);
        this.detach();
        break;
      case 'Tab':
        this.isOpen.set(false);
        this.activeIndex.set(-1);
        this.detach();
        break;
    }
  }

  handleClick(city: string, event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.select(city);
  }

  private select(city: string): void {
    this.searchTerm.set(city);
    this.value.set(city);
    const delay = this.isAndroidApp ? 50 : 0;
    setTimeout(() => {
      this.isOpen.set(false);
      this.activeIndex.set(-1);
      this.detach();
    }, delay);
  }

  optionId(index: number): string {
    return `${this.listboxId}-${index}`;
  }

  private attach(): void {
    window.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  private detach(): void {
    window.removeEventListener('scroll', this.onScroll, { capture: true });
    window.removeEventListener('resize', this.onResize);
  }

  private updatePosition(): void {
    const inputEl = this.el.nativeElement.querySelector('input') as HTMLElement;
    if (!inputEl) return;
    const rect = inputEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const estHeight = Math.min(this.filteredCities().length, 5) * 40 + 8;
    const below = vh - rect.bottom - 8;
    if (below < estHeight && rect.top - 8 > estHeight) {
      this.dropdownTop.set(Math.max(8, rect.top - estHeight - 4));
    } else {
      this.dropdownTop.set(rect.bottom + 4);
    }
    this.dropdownLeft.set(Math.max(8, rect.left));
    this.dropdownWidth.set(Math.min(rect.width, vw - 16));
  }

  get isWebView(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator?.userAgent?.toLowerCase() || '';
    return ua.includes(' webview');
  }

  get isAndroidApp(): boolean {
    const isWebView = this.isWebView;
    const isAndroid = window.navigator?.userAgent?.toLowerCase().includes('android') || false;
    return isWebView && isAndroid;
  }
}
