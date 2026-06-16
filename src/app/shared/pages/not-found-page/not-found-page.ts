import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from "@shared/components/button-component/button-component";

@Component({
  selector: 'app-not-found-page',
  imports: [
    ButtonComponent
  ],
  templateUrl: './not-found-page.html',
})
export class NotFoundPage {
  private location = inject(Location);
  
  protected navigateBack(): void {
    this.location.back();
  }
}
