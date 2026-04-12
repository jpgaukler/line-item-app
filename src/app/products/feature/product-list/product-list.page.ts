import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.page.html',
})
export class ProductListPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);

  products: Product[] = [
    {
      id: crypto.randomUUID(),
      name: 'D Style Floor Hopper',
      description: 'Description of Product 1',
      productCodeDefinition: 'HPD-XXX-XXX',
      selections: [
        {
          name: 'Selection 1',
          options: [
            {
              value: '1',
              displayText: 'Option 1',
            },
            {
              value: '2',
              displayText: 'Option 2',
            },
            {
              value: '3',
              displayText: 'Option 3',
            },
          ],
          defaultValue: '1',
          allowCustomValue: false,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Flexible Screw Conveyor',
      description: 'Description of Product 2',
      productCodeDefinition: 'FS-XX',
      selections: [
        {
          name: 'Selection 1',
          options: [
            {
              value: '1',
              displayText: 'Option 1',
            },
            {
              value: '2',
              displayText: 'Option 2',
            },
            {
              value: '3',
              displayText: 'Option 3',
            },
          ],
          defaultValue: '1',
          allowCustomValue: true,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Discharge Adapter',
      description: 'Description of Product 3',
      productCodeDefinition: 'DSC-XX',
      selections: [
        {
          name: 'Selection 1',
          options: [
            {
              value: '1',
              displayText: 'Option 1',
            },
            {
              value: '3',
              displayText: 'Option 3',
            },
          ],
          defaultValue: '1',
          allowCustomValue: false,
        },
      ],
    },
  ];

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
    ]);
  }

  ngOnDestroy(): void {
    this.layoutService.updateBreadcrumbs$.next([]);
  }
}
