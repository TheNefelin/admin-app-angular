import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UrlService } from '@features/url/services/url-service';
import { catchError, of } from 'rxjs';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  selector: 'app-url-page',
  imports: [
    JsonPipe,
    LoadingComponent,
  ],
  templateUrl: './url-page.html',
})
export class UrlPage {
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly urlService = inject(UrlService);
  private readonly getUrlPayload = signal<number>(1);

  protected readonly getUrlRX = rxResource({
    params: () => this.getUrlPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.urlService.getById(id).pipe(
        catchError(err => {
          this.errorMessage.set(`[UrlService] Error fetching: ${err}`);
          console.error('[UrlService] Error fetching:', err);
          return of(null);
        })
      );
    },
  });

}
