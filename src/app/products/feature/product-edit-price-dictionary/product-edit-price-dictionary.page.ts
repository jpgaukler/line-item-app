import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { logJsonSize } from '../../../shared/utils/data-utils';
import { ProductEditPriceDictionaryService } from '../../data-access/product-edit-price-dictionary.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonDirective],
  templateUrl: './product-edit-price-dictionary.page.html',
  providers: [ProductEditPriceDictionaryService],
})
export class ProductEditPriceDictionaryPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly productEditPriceDictionaryService = inject(ProductEditPriceDictionaryService);

  showDebug = signal<boolean>(false);
  productCodePrices = computed(() =>
    Object.entries(this.productEditPriceDictionaryService.productCodePriceDictionary().prices)
      .map(([productCode, price]) => ({
        productCode,
        price,
      }))
      .sort((a, b) => a.productCode.localeCompare(b.productCode)),
  );

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
    ]);
  }

  calculateJsonSize() {
    logJsonSize(this.productEditPriceDictionaryService.productCodePriceDictionary());
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }
}
