import { Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

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

  saveSidebarState(state: boolean): void {
    this.storage.setItem('sidebar-state', String(state));
  }

  loadSidebarState(): Observable<boolean | null> {
    const value = this.storage.getItem('sidebar-state');
    return of(value === null ? null : value === 'true');
  }
}
