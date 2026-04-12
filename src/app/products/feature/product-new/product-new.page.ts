import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-new.page.html',
})
export class ProductNewPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  private readonly formBuilder = inject(FormBuilder);

  newProductForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required, Validators.minLength(3), Validators.maxLength(30)],
    description: ['', Validators.required, Validators.maxLength(200)],
  });

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'New', url: '/products/new' },
    ]);
  }

  submit(): void {}

  ngOnDestroy(): void {
    this.layoutService.updateBreadcrumbs$.next([]);
  }
}
