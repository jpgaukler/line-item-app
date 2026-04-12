import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonPrimaryDirective } from '../../../shared/ui/button-primary.directive';
import { ProductListService } from '../../data-access/product-list.service';
import { AddProduct } from '../../interfaces/product.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ReactiveFormsModule, ButtonPrimaryDirective],
  templateUrl: './product-new.page.html',
})
export class ProductNewPage implements OnDestroy {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly layoutService = inject(LayoutService);
  public readonly productListService = inject(ProductListService);

  MAX_NAME_LENGTH = 30;
  MAX_DESCRIPTION_LENGTH = 200;

  newProductForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(this.MAX_NAME_LENGTH)]],
    description: ['', [Validators.required, Validators.maxLength(this.MAX_DESCRIPTION_LENGTH)]],
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

    const newProduct: AddProduct = {
      name: this.nameControl.value!,
      description: this.descriptionControl.value!,
    };

    this.productListService.addProduct$.next(newProduct);

    this.router.navigate(['/products']);
  }
}
