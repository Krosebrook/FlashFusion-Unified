import { Routes } from '@angular/router';

export const flashcardsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/flashcards.component').then(m => m.FlashcardsComponent)
  }
];