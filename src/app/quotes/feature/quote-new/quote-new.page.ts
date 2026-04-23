import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ProductListService } from '../../../products/data-access/product-list.service';
import { ProductSelectionOption } from '../../../products/interfaces/product-selection-option.interface';
import { ProductSelection } from '../../../products/interfaces/product-selection.interface';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { QuoteNewService } from '../../data-access/quote-new.service';
import { QuoteItemSelection } from '../../interfaces/quote-item-selection.interface';
import { QuoteItemKey } from '../../interfaces/quote-item.interface';
import { QuoteSystemKey } from '../../interfaces/quote-system.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ButtonDirective, ReactiveFormsModule, FormsModule, CdkDropList, CdkDrag],
  templateUrl: './quote-new.page.html',
  providers: [ProductListService, QuoteNewService],
})
export class QuoteNewPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly productListService = inject(ProductListService);
  public readonly quoteNewService = inject(QuoteNewService);
  // open = false;
  // selected: ProductSelectionOption | null = null;

  // select(option: ProductSelectionOption) {
  //   this.selected = option;
  //   this.open = false;
  //   this.onSelectionChange(option.value);
  // }

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

  onSelectionChange(
    itemKey: QuoteItemKey,
    itemSelection: QuoteItemSelection,
    productSelection: ProductSelection,
    newValue: string,
  ) {
    const optionSelected: ProductSelectionOption = productSelection.options.find(
      (o) => o.value === newValue,
    )!;

    const updatedSelection: QuoteItemSelection = {
      ...itemSelection,
      displayText: optionSelected.displayText,
      value: optionSelected.value,
    };

    this.quoteNewService.updateItemSelection$.next({ itemKey, updatedSelection });
  }

  reorderSystem(event: CdkDragDrop<any>): void {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    this.quoteNewService.reorderSystem$.next({ previousIndex, currentIndex });
  }

  reorderItem(systemKey: QuoteSystemKey, event: CdkDragDrop<any>): void {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    this.quoteNewService.reorderItem$.next({ systemKey, previousIndex, currentIndex });
  }

  toJSON(map: Map<any, any>) {
    return Object.fromEntries(map);
  }
}
