import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/m/home', pathMatch: 'full' },
  {
    path: 'm',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/mobile/mobile-shell/mobile-shell').then(m => m.MobileShell),
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          {
            path: 'home',
            loadComponent: () => import('./pages/mobile/home').then(m => m.Home),
          },
          {
            path: 'bookings',
            loadComponent: () => import('./pages/mobile/bookings/bookings').then(m => m.Bookings),
          },
          {
            path: 'booking/:id',
            loadComponent: () => import('./pages/mobile/booking-detail/booking-detail').then(m => m.BookingDetail),
          },
          {
            path: 'profile',
            loadComponent: () => import('./pages/mobile/profile/profile').then(m => m.Profile),
          },
          {
            path: 'login',
            loadComponent: () => import('./pages/mobile/login/login').then(m => m.Login),
          },
          {
            path: 'register',
            loadComponent: () => import('./pages/mobile/register/register').then(m => m.Register),
          },
        ],
      },
      {
        path: 'results',
        loadComponent: () => import('./pages/mobile/search-results').then(m => m.SearchResults),
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
  {
    path: '',
    loadComponent: () =>
    import('./layout/navbar/navbar.component')
    .then(m => m.NavbarComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
        import('./pages/home/main/main')
        .then(m => m.Main),
      },
      {
        path: 'search-results',
        loadComponent: () =>
        import('./pages/search-results/search-results')
        .then(m => m.SearchResultsComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
        import('./pages/auth/login/login')
        .then(m => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
        import('./pages/auth/register/register')
        .then(m => m.Register),
      },
      {
        path: 'bookings',
        loadComponent: () =>
        import('./pages/bookings/bookings')
        .then(m => m.BookingsComponent),
      },
      {
        path: 'booking/:id',
        loadComponent: () =>
        import('./pages/booking-detail/booking-detail')
        .then(m => m.BookingDetailComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
        import('./pages/profile/profile')
        .then(m => m.ProfileComponent),
      },
    ]
  },
];
