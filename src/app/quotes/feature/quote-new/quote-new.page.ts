import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { LayoutService } from '../../../layout/data-access/layout.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule],
  templateUrl: './quote-new.page.html',
  providers: [],
})
export class QuoteNewPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);

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
