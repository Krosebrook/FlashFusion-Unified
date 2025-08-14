import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  },
  {
    path: 'study',
    loadChildren: () => import('./features/study/study.routes').then(m => m.studyRoutes)
  },
  {
    path: 'flashcards',
    loadChildren: () => import('./features/flashcards/flashcards.routes').then(m => m.flashcardsRoutes)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
