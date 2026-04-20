import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ProductListService } from '../../../products/data-access/product-list.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { QuoteFormService } from '../../data-access/quote-form.service';
import { QuoteForm } from '../../interfaces/quote-form.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ButtonDirective],
  templateUrl: './quote-new.page.html',
  providers: [ProductListService, QuoteFormService],
})
export class QuoteNewPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly productListService = inject(ProductListService);
  public readonly quoteFormService = inject(QuoteFormService);

  quoteForm: FormGroup<QuoteForm> = this.quoteFormService.toQuoteForm({
    name: '',
    customerName: '',
    customerEmail: '',
    price: 0,
    systems: [
      {
        name: 'System 1',
        price: 0,
        items: [],
      },
    ],
  });

  get systemsArray() {
    return this.quoteForm.controls.systems;
  }

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
}
