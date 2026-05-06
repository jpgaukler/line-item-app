import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
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

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'Edit Product', url: '/products/edit' },
    ]);
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }
}
