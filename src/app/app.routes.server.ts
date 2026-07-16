import { RenderMode, ServerRoute } from '@angular/ssr';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

export const serverRoutes: ServerRoute[] = [
  {
    path:  `${ ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.PROJECT.FORM }/:id`,
    renderMode: RenderMode.Client
  },
  {
    path: ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.PROJECT.FORM,
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
