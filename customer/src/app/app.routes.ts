import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/webshell/webshell').then(m => m.WebShell),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./pages/responsive/home').then(m => m.ResponsiveHome),
      },
      {
        path: 'search-results',
        loadComponent: () => import('./pages/responsive/search-results').then(m => m.ResponsiveSearchResults),
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/responsive/login').then(m => m.ResponsiveLogin),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/responsive/register').then(m => m.ResponsiveRegister),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/responsive/bookings').then(m => m.ResponsiveBookings),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/responsive/profile').then(m => m.ResponsiveProfile),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications').then(m => m.NotificationsPage),
      },
      {
        path: 'notifications/:id',
        loadComponent: () => import('./pages/notification-detail/notification-detail').then(m => m.NotificationDetailPage),
      },
      {
        path: 'terms',
        loadComponent: () => import('./pages/terms/terms').then(m => m.TermsPage),
      },
      {
        path: 'blogs',
        loadComponent: () => import('./pages/blog/blog').then(m => m.BlogComponent),
      },
      {
        path: 'blogs/blog/:slug',
        loadComponent: () => import('./pages/blog-detail/blog-detail').then(m => m.BlogDetailComponent),
      },
      {
        path: 'seat/:tripId',
        loadComponent: () => import('./pages/mobile/select-seat').then(m => m.SelectSeat),
      },
      {
        path: 'passenger',
        loadComponent: () => import('./pages/mobile/passenger-details').then(m => m.PassengerDetails),
      },
      {
        path: 'payment',
        loadComponent: () => import('./pages/mobile/payment-details').then(m => m.PaymentDetails),
      },
    ],
  },

];
