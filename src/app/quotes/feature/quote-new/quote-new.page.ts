import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ProductListService } from '../../../products/data-access/product-list.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { QuoteNewService } from '../../data-access/quote-new.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ButtonDirective, ReactiveFormsModule, FormsModule],
  templateUrl: './quote-new.page.html',
  providers: [ProductListService, QuoteNewService],
})
export class QuoteNewPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly productListService = inject(ProductListService);
  public readonly quoteNewService = inject(QuoteNewService);

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Quotes', url: '/quotes' },
      { label: 'New', url: '/products/new' },
    ]);
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }

  onSelectionChange(event: any) {
    console.log('onSelectionCHange', event);
  }

  toJSON(map: Map<any, any>) {
    return Object.fromEntries(map);
  }
}
