import { Routes } from '@angular/router';

export const studyRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/study.component').then(m => m.StudyComponent)
  }
];