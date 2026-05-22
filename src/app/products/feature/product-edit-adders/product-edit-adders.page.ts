import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ProductEditService } from '../../data-access/product-edit.service';
import { ProductAdderComponent } from '../../ui/product-adder/product-adder.component';

@Component({
  selector: 'app-product-edit-adders',
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag, ProductAdderComponent],
  providers: [ProductEditService],
  templateUrl: './product-edit-adders.page.html',
})
export class ProductEditAddersPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly productEditService = inject(ProductEditService);
  private readonly activatedRoute = inject(ActivatedRoute);

  productId = toSignal(this.activatedRoute.paramMap.pipe(map((params) => params.get('productId'))));
  showDebug = signal<boolean>(false);

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

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }
}
