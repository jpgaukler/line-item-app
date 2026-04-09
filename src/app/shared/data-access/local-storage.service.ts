import { Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LayoutState } from '../../layout/data-access/layout.service';

const LOCAL_STORAGE = new InjectionToken<Storage>('window local storage object', {
  providedIn: 'root',
  factory: () => {
    return inject(PLATFORM_ID) === 'browser' ? window.localStorage : ({} as Storage);
  },
});

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly storage = inject(LOCAL_STORAGE);

  loadLayoutState(): Observable<LayoutState | null> {
    const theme = this.storage.getItem('layout-state');
    return of(theme ? (JSON.parse(theme) as LayoutState) : null);
  }

  saveLayoutState(state: LayoutState): void {
    this.storage.setItem('layout-state', JSON.stringify(state));
  }
}
