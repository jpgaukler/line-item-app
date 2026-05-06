import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, map, Observable, of, switchMap, tap } from 'rxjs';
import { Product } from '../../products/interfaces/product.interface';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ProductHttpService {
  private readonly http = inject(HttpClient);
  private readonly localStorageService = inject(LocalStorageService);
  private baseUrl = 'line-item.app';

  // getProducts(): Observable<Product[]> {
  //   const url: string = `${this.baseUrl}/api/v1/products`;
  //   return this.http.get<Product[]>(url);
  // }

  saveProducts(products: Product[]): void {
    this.localStorageService.setJson('products', products);
  }

  saveProduct(product: Product): void {
    const products = this.localStorageService.getJson<Product[]>('products') || [];
    const updatedProducts = products.map((p) => (p.id === product.id ? product : p));
    this.localStorageService.setJson('products', updatedProducts);
  }

  // saveProduct(product: Product): Observable<void> {
  //   // this.http.get(`/api/v1/products`, { observe: 'response' }).subscribe((result) => {
  //   //   if (result.status === 200) {
  //   //     console.log('Product saved successfully', product);
  //   //   } else {
  //   //     console.error('Failed to save product', result);
  //   //   }
  //   // });

  //   const products = this.localStorageService.getJson<Product[]>('products') || [];
  //   const updatedProducts = products.map((p) => (p.id === product.id ? product : p));
  //   this.localStorageService.setJson('products', updatedProducts);
  //   return of(undefined);
  // }

  getProducts(): Observable<Product[]> {
    return this.localStorageService.loadJson<Product[]>('products').pipe(
      delay(500),
      map((products) => products ?? []),
      tap((products) =>
        products.length === 0
          ? console.log('No products in local storage. Loading default products.')
          : console.log(`${products.length} products loaded from local storage.`),
      ),
      switchMap((products) =>
        products.length === 0 ? this.http.get<Product[]>('data/products.json') : of(products),
      ),
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.localStorageService.loadJson<Product[]>('products').pipe(
      delay(500),
      map((products) => {
        const product = products?.find((p) => p.id === id);
        if (!product) {
          throw new Error(`Product with Id ${id} not found!`);
        } else {
          return product;
        }
      }),
    );
  }

  // createProduct(): Observable<Product[] | null> {
  // }
}
