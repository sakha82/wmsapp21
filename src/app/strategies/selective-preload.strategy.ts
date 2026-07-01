import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const preload = route.data?.['preload'];

    if (preload === true) {
      return load();
    }

    if (preload === 'delay') {
      return timer(5000).pipe(switchMap(() => load()));
    }

    return of(null);
  }
}
