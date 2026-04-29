import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ProductListService } from '../../../products/data-access/product-list.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { QuoteNewService } from '../../data-access/quote-new.service';
import { QuoteSystemKey } from '../../interfaces/quote-system.interface';
import { DragHandleComponent } from '../../ui/drag-handle/drag-handle.component';
import { QuoteItemComponent } from '../../ui/quote-item/quote-item.component';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    ButtonDirective,
    ReactiveFormsModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    DragHandleComponent,
    QuoteItemComponent,
  ],
  templateUrl: './quote-new.page.html',
  providers: [ProductListService, QuoteNewService],
})
export class QuoteNewPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly productListService = inject(ProductListService);
  public readonly quoteNewService = inject(QuoteNewService);

  showDebug = signal<boolean>(false);

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
