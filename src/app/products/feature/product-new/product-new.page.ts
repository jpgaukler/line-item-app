import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ProductHttpService } from '../../../shared/data-access/product.http.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { ProductListService } from '../../data-access/product-list.service';
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  NewProduct,
} from '../../interfaces/product.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ButtonDirective, FormField],
  templateUrl: './product-new.page.html',
  providers: [ProductListService],
})
export class ProductNewPage implements OnDestroy {
  private readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);
  public readonly productHttpService = inject(ProductHttpService);

  maxNameLength = MAX_PRODUCT_NAME_LENGTH;
  maxDescriptionLength = MAX_PRODUCT_DESCRIPTION_LENGTH;

  newProduct = signal<NewProduct>({
    name: '',
    description: '',
  });

  newProductForm = form(this.newProduct, (form) => {
    required(form.name);
    maxLength(form.name, MAX_PRODUCT_NAME_LENGTH);
    required(form.description);
    maxLength(form.description, MAX_PRODUCT_DESCRIPTION_LENGTH);
  });

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

  submit(event: Event) {
    event.preventDefault();

    submit(this.newProductForm, async () => {
      const newProduct = this.newProduct();
      this.productHttpService.createProduct(newProduct);
      this.router.navigate(['/products']);
    });
  }
}
