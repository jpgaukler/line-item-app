import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { ProductListService } from '../../data-access/product-list.service';

@Component({
  selector: 'app-products',
  imports: [FormsModule, RouterLink, ButtonDirective],
  templateUrl: './product-list.page.html',
  providers: [ProductListService],
})
export class ProductListPage implements OnDestroy {
  public readonly productListService = inject(ProductListService);
  private readonly layoutService = inject(LayoutService);

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
    ]);
  }

  exportProducts(): void {
    const products = this.productListService.products();

    // const json = JSON.stringify(products, null, 2); // pretty print
    const json = JSON.stringify(products);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'products.json';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }
}
