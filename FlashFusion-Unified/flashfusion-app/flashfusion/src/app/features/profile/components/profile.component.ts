import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container p-4">
      <h1>User Profile</h1>
      <p>Manage your profile settings and preferences here. Coming soon!</p>
    </div>
  `
})
export class ProfileComponent {}