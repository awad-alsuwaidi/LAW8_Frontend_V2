import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { SharedService } from 'src/app/@shared/services/shared.service';

export class MultiTranslateHttpLoader implements TranslateLoader {
  private sharedService = inject(SharedService);
  constructor(
    private httpClient: HttpClient,

    public resources: { prefix: string; suffix: string }[]
  ) {}

  public getTranslation(lang: string): Observable<any> {
    return of(null).pipe(
      switchMap(
        () =>
          new Observable<any>((observer) => {
            setTimeout(() => {
              const requests = this.resources.map(({ prefix, suffix }) =>
                this.httpClient.get(`${prefix}${lang}${suffix}`).pipe(
                  catchError((error: HttpErrorResponse) => {
                    if (error.status === 0) {
                      return of({});
                    } else {
                      return throwError(error);
                    }
                  })
                )
              );

              forkJoin(requests).subscribe(
                (responses: any[]) => {
                  observer.next(Object.assign({}, ...responses));
                  observer.complete();
                  this.sharedService.isJsonLoaded = true;
                },
                (error) => observer.error(error)
              );
            }, 100);
          })
      )
    );
  }
}
