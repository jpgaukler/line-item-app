import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { logJsonSize } from '../../../shared/utils/data-utils';
import { ProductEditService } from '../../data-access/product-edit.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonDirective],
  templateUrl: './product-edit-price-dictionary.page.html',
  providers: [ProductEditService],
})
export class ProductEditPriceDictionaryPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly productEditService = inject(ProductEditService);
  private readonly activatedRoute = inject(ActivatedRoute);

  productId = toSignal(this.activatedRoute.paramMap.pipe(map((params) => params.get('productId'))));
  showDebug = signal<boolean>(false);
  productCodePrices = computed(() =>
    Object.entries(this.productEditService.productCodePriceDictionary().prices)
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

    effect(() => {
      const productId = this.productId();

      if (productId) {
        this.productEditService.loadProduct$.next({ productId });
      }
    });
  }

  calculateJsonSize() {
    logJsonSize(this.productEditService.productCodePriceDictionary());
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }
}
