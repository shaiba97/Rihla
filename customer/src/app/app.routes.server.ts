import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'search-results',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'seat/:tripId',
    renderMode: RenderMode.Client
  },
  {
    path: 'passenger',
    renderMode: RenderMode.Client
  },
  {
    path: 'payment',
    renderMode: RenderMode.Client
  },
  {
    path: 'm',
    renderMode: RenderMode.Client
  },
  {
    path: 'm/results',
    renderMode: RenderMode.Client
  },
  {
    path: 'm/seat/:tripId',
    renderMode: RenderMode.Client
  },
  {
    path: 'm/passenger',
    renderMode: RenderMode.Client
  },
  {
    path: 'm/payment',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
