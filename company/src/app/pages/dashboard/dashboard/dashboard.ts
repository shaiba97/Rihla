import { Component } from '@angular/core';
import { LucideLayoutDashboard } from '@lucide/angular';

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [LucideLayoutDashboard],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {}