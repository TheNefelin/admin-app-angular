import { Component } from '@angular/core';
import { DashboardBtnComponent } from "@features/dashboard/components/dashboard-btn-component/dashboard-btn-component";

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DashboardBtnComponent
  ],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {}
