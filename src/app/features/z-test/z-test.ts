import { JsonPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SourceService } from '@features/game-guides/source/services/source-service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-z-test',
  imports: [
    JsonPipe,
  ],
  templateUrl: './z-test.html',
})
export class ZTest {

  private readonly service = inject(SourceService)
  private readonly id = signal<number>(1);
  protected readonly computedData = computed<any>(() => this.getByIdRX.value());

  protected readonly getByIdRX = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.service.getById(id).pipe(
        catchError(err => {
          console.error('[UrlService::UrlPage] getById:', err);
          return of(null);
        })
      );
    },
  });

}
