import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'home', renderMode: RenderMode.Server },
  { path: 'm', renderMode: RenderMode.Server },
  { path: 'm/home', renderMode: RenderMode.Server },
  { path: 'search-results', renderMode: RenderMode.Server },
  { path: 'm/results', renderMode: RenderMode.Server },
  { path: 'blogs', renderMode: RenderMode.Server },
  { path: 'blogs/blog/:slug', renderMode: RenderMode.Server },
  { path: 'm/blogs', renderMode: RenderMode.Server },
  { path: 'm/blogs/blog/:slug', renderMode: RenderMode.Server },
  { path: 'seat/:tripId', renderMode: RenderMode.Server },
  { path: 'm/seat/:tripId', renderMode: RenderMode.Server },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
