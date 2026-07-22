import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes')
        .then(m => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout/layout')
        .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path:  '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard/dashboard')
            .then(m => m.DashboardComponent),
      },
      {
        path: 'buses/bus/:id',
        loadComponent: () =>
          import('./pages/buses/bus-details')
            .then(m => m.BusDetailsComponent),
      },
      {
        path: 'buses',
        loadComponent: () =>
          import('./pages/buses/buses/buses')
            .then(m => m.BusesComponent),
      },
      {
        path: 'trips',
        loadComponent: () =>
          import('./pages/trips/trips/trips')
            .then(m => m.TripsComponent),
      },
      {
        path: 'trips/trip/trip-details/:id',
        loadComponent: () =>
          import('./pages/trip-details/trip-details')
            .then(m => m.TripDetailsComponent),
      },
      {
        path: 'financials',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/financials/financials/financials')
                .then(m => m.FinancialsComponent),
          },
          {
            path: 'payout',
            loadComponent: () =>
              import('./pages/payout/payout/payout')
                .then(m => m.PayoutComponent),
          },
        ],
      },
      { path: 'payout', redirectTo: 'financials/payout', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile/profile')
            .then(m => m.ProfileComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];