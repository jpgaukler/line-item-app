import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormField } from '@angular/forms/signals';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { logJsonSize } from '../../../shared/utils/data-utils';
import { ProductEditService } from '../../data-access/product-edit.service';
import { ProductInputComponent } from '../../ui/product-input/product-input.component';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    ButtonDirective,
    CdkDropList,
    CdkDrag,
    CdkCopyToClipboard,
    RouterLink,
    FormField,
    ProductInputComponent,
  ],
  templateUrl: './product-edit.page.html',
  providers: [ProductEditService],
})
export class ProductEditPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly productEditService = inject(ProductEditService);
  private readonly activatedRoute = inject(ActivatedRoute);

  showDebug = signal<boolean>(false);

  productId = toSignal(this.activatedRoute.paramMap.pipe(map((params) => params.get('productId'))));

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

  addInput() {
    this.productEditService
      .productForm()
      .inputs()
      .value.update((inputs) => [
        ...inputs,
        {
          name: `New Input (${inputs.length + 1})`,
          defaultOptionIndex: 0,
          allowCustomValue: false,
          options: [{ displayText: 'Option (1)', value: '1' }],
        },
      ]);
  }

  reorderInput(event: CdkDragDrop<any>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) {
      return;
    }

    const updatedInputs = [...this.productEditService.productForm().inputs().value()];
    moveItemInArray(updatedInputs, previousIndex, currentIndex);
    this.productEditService.productForm().inputs().value.set(updatedInputs);
  }

  removeInput(index: number) {
    const inputsArray = this.productEditService.productForm().inputs().value();

    if (inputsArray.length <= 1) {
      return;
    }

    // remove option
    this.productEditService
      .productForm()
      .inputs()
      .value.update((inputs) => inputs.filter((_, i) => i !== index));
  }

  submit(): void {
    // if (this.productForm.invalid) {
    //   this.productForm.markAllAsTouched();
    //   return;
    // }
    // this.productEditService.updateProduct$.next(
    //   this.productFormService.toProduct(this.productForm),
    // );
  }

  reset(): void {
    // this.initializeProductForm(this.productEditService.product());
  }

  calculateJsonSize() {
    logJsonSize(this.productEditService.product());
  }
}
