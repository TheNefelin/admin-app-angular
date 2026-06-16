import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@layouts/main-layout-component/main-layout-component';
import { NotFoundPage } from '@shared/pages/not-found-page/not-found-page';

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
        path: 'url-grp',
        loadChildren: () => import('@features/url-grp/url-grp.routes').then(m => m.URL_GRP_ROUTES),
      },
      {
        path: 'url',
        loadChildren: () => import('@features/url/url.routes').then(m => m.URL_ROUTES),
      },
      {
        path: 'language',
        loadChildren: () => import('@features/language/language.routes').then(m => m.LANGUAGE_ROUTES),
      },
      {
        path: 'technology',
        loadChildren: () => import('@features/technology/technology.routes').then(m => m.TECHNOLOGY_ROUTES),
      },
      {
        path: 'technology',
        loadChildren: () => import('@features/technology/technology.routes').then(m => m.TECHNOLOGY_ROUTES),
      },
      {
        path: 'project',
        loadChildren: () => import('@features/project/project.routes').then(m => m.PROJECT_ROUTES),
      },
    ]
  },
  {
    path: '**',
    component: NotFoundPage
  },
];
