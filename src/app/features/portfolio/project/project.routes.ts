import { Routes } from "@angular/router";
import { ProjectPage } from "@features/portfolio/project/pages/project-page/project-page";
import { ProjectFormPage } from "@features/portfolio/project/pages/project-form-page/project-form-page";

export const  PROJECT_ROUTES: Routes = [
  {
    path: '',
    component: ProjectPage
  },
  {
    path: 'form',
    component: ProjectFormPage
  },
  {
    path: 'form/:id',
    component: ProjectFormPage
  },
]