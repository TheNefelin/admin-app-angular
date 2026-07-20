import { Routes } from '@angular/router';
import { GuideGamesLayoutComponent } from '@layouts/guide-games-layout-component/guide-games-layout-component';
import { MainLayoutComponent } from '@layouts/main-layout-component/main-layout-component';
import { PortfolioLayoutComponent } from '@layouts/portfolio-layout-component/portfolio-layout-component';
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
    ]
  },
  {
    path: "portfolio",
    component: PortfolioLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'url-grp',
        loadChildren: () => import('@features/portfolio/url-grp/url-grp.routes').then(m => m.URL_GRP_ROUTES),
      },
      {
        path: 'url',
        loadChildren: () => import('@features/portfolio/url/url.routes').then(m => m.URL_ROUTES),
      },
      {
        path: 'language',
        loadChildren: () => import('@features/portfolio/language/language.routes').then(m => m.LANGUAGE_ROUTES),
      },
      {
        path: 'technology',
        loadChildren: () => import('@features/portfolio/technology/technology.routes').then(m => m.TECHNOLOGY_ROUTES),
      },
      {
        path: 'project',
        loadChildren: () => import('@features/portfolio/project/project.routes').then(m => m.PROJECT_ROUTES),
      },
    ]
  },
  {
    path: "game-guides",
    component: GuideGamesLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'genre',
        loadChildren: () => import('@features/game-guides/genre/genre.routes').then(m => m.GENRE_ROUTES),
      },
      {
        path: 'platform',
        loadChildren: () => import('@features/game-guides/platform/platform.routes').then(m => m.PLATFORM_ROUTES),
      },
      {
        path: 'game',
        loadChildren: () => import('@features/game-guides/game/game.routes').then(m => m.GAME_ROUTES),
      },
    ]
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
