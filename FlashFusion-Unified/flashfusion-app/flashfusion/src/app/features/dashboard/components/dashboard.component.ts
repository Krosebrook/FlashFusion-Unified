import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container p-4">
      <h1>FlashFusion Dashboard</h1>
      <p>Welcome to your learning dashboard! This feature is coming soon.</p>
    </div>
  `
})
export class DashboardComponent {}