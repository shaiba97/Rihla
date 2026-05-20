import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'users', loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent) },
      { path: 'users/:id', loadComponent: () => import('./pages/users/user-detail/user-detail').then(m => m.UserDetailComponent) },
      { path: 'companies', loadComponent: () => import('./pages/companies/companies').then(m => m.CompaniesComponent) },
      { path: 'companies/:id', loadComponent: () => import('./pages/companies/company-detail/company-detail').then(m => m.CompanyDetailComponent) },
      { path: 'financial', loadComponent: () => import('./pages/financial/financial').then(m => m.FinancialComponent) },
      { path: 'platform-fee', loadComponent: () => import('./pages/platform-fee/platform-fee').then(m => m.PlatformFeeComponent) },
      { path: 'payment-accounts', loadComponent: () => import('./pages/payment-accounts/payment-accounts').then(m => m.PaymentAccountsComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent) },
    ],
  },
  { path: 'auth/login', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent) },
  { path: 'auth/register', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent) },
  { path: '**', redirectTo: 'dashboard' },
];
