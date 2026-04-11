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

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  loadItem(key: string): Observable<string | null> {
    const value = this.storage.getItem(key);
    return of(value === null ? null : value);
  }
}
