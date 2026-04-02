import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ResolutionManagementComponent } from './components/resolution-management/resolution-management.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'analytics',
        component: AnalyticsComponent
      },
      {
        path: 'resolutions',
        component: ResolutionManagementComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
