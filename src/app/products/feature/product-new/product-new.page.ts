import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonPrimaryDirective } from '../../../shared/ui/button-primary.directive';
import { ProductListService } from '../../data-access/product-list.service';
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
} from '../../interfaces/product.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ReactiveFormsModule, ButtonPrimaryDirective],
  templateUrl: './product-new.page.html',
  providers: [ProductListService],
})
export class ProductNewPage implements OnDestroy {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly layoutService = inject(LayoutService);
  public readonly productListService = inject(ProductListService);

  maxNameLength = MAX_PRODUCT_NAME_LENGTH;
  maxDescriptionLength = MAX_PRODUCT_DESCRIPTION_LENGTH;

  newProductForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(MAX_PRODUCT_NAME_LENGTH)]],
    description: ['', [Validators.required, Validators.maxLength(MAX_PRODUCT_DESCRIPTION_LENGTH)]],
  });

  nameControl = this.newProductForm.controls.name;
  descriptionControl = this.newProductForm.controls.description;

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'New', url: '/products/new' },
    ]);
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }

  submit(): void {
    if (this.newProductForm.invalid) {
      this.newProductForm.markAllAsTouched();
      return;
    }

    this.productListService.addProduct$.next({
      name: this.nameControl.value!,
      description: this.descriptionControl.value!,
    });

    this.router.navigate(['/products']);
  }
}
