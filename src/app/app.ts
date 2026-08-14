import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackHostComponent } from '@shared/components/feedback-host-component/feedback-host-component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FeedbackHostComponent,
  ],
  templateUrl: './app.html',
})
export class App {}