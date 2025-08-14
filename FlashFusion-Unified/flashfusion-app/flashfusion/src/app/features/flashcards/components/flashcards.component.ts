import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container p-4">
      <h1>Flashcard Management</h1>
      <p>Create and manage your flashcard decks here. Coming soon!</p>
    </div>
  `
})
export class FlashcardsComponent {}