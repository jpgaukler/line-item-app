import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonPrimaryDirective } from '../../../shared/ui/button-primary.directive';
import { ProductListService } from '../../data-access/product-list.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterLink, ButtonPrimaryDirective],
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

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }
}
