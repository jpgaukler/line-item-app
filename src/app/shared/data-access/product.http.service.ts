import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { Product } from '../../products/interfaces/product.interface';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ProductHttpService {
  private readonly http = inject(HttpClient);
  private readonly localStorageService = inject(LocalStorageService);
  private baseUrl = 'cadflair.com';

  // getProducts(): Observable<Product[]> {
  //   const url: string = `${this.baseUrl}/api/v1/products`;
  //   return this.http.get<Product[]>(url);
  // }

  saveProducts(products: Product[]): void {
    this.localStorageService.setItem('products', JSON.stringify(products));
  }

  getProducts(): Observable<Product[]> {
    return this.localStorageService.loadItem<Product[]>('products').pipe(
      delay(1000),
      map((products) => (products ?? []).sort((a, b) => a.name.localeCompare(b.name))),
    );
  }

  // createProduct(): Observable<Product[] | null> {
  // }
}
