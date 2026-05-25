import { signal, DestroyRef, inject } from '@angular/core';

export function useIsMobile(breakpoint = 768): import('@angular/core').Signal<boolean> {
  const isMobile = signal(typeof window !== 'undefined' ? window.innerWidth < breakpoint : false);
  const destroyRef = inject(DestroyRef);

  if (typeof window !== 'undefined') {
    const onResize = () => isMobile.set(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
  }

  return isMobile.asReadonly();
}
