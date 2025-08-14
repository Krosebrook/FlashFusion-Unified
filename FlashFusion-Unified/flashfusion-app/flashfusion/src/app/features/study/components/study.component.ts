import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container p-4">
      <h1>Study Session</h1>
      <p>Your interactive study sessions will appear here. Coming soon!</p>
    </div>
  `
})
export class StudyComponent {}