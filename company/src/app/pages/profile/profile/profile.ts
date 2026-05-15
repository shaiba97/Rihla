import { Component } from '@angular/core';
import { LucideUser } from '@lucide/angular';

@Component({
  selector:    'app-profile',
  standalone:  true,
  imports:     [LucideUser],
  templateUrl: './profile.html',
})
export class ProfileComponent {}