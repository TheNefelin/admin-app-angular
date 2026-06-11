import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@layouts/main-layout-component/main-layout-component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'url',
        loadChildren: () => import('@features/url/url.routes').then(m => m.URL_ROUTES),
      },
    ]
  },
];
