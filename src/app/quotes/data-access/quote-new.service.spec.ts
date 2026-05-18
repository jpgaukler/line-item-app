import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { Product } from '../../products/interfaces/product.interface';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { QuoteSystemKey } from '../interfaces/quote-system.interface';
import { QuoteNewService } from './quote-new.service';

describe('QuoteNewService', () => {
  let service: QuoteNewService;
  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'Test Product 1',
      description: 'A test product',
      productCodeFormula: '=SKU-[Color]',
      inputs: [
        {
          name: 'Color',
          allowCustomValue: false,
          defaultOptionIndex: 0,
          options: [
            { displayText: 'Red', value: 'RED' },
            { displayText: 'Blue', value: 'BLUE' },
          ],
        },
      ],
    },
    {
      id: 'product-2',
      name: 'Test Product 2',
      description: 'Another test product',
      productCodeFormula: '=SKU-[Size]',
      inputs: [
        {
          name: 'Size',
          allowCustomValue: false,
          defaultOptionIndex: 1,
          options: [
            { displayText: 'Small', value: 'SM' },
            { displayText: 'Large', value: 'LRG' },
          ],
        },
      ],
    },
    {
      id: 'product-3',
      name: 'Test Product 3',
      description: 'Third test product',
      productCodeFormula: '=SKU-[Diameter]',
      inputs: [
        {
          name: 'Diameter',
          allowCustomValue: false,
          defaultOptionIndex: 0,
          options: [
            { displayText: '1 inch', value: '1' },
            { displayText: '2 inch', value: '2' },
          ],
        },
      ],
    },
  ];

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        QuoteNewService,
        {
          provide: ProductHttpService,
          useValue: {
            getProducts: () => of(mockProducts),
            getProductPrice: () => of(999),
          },
        },
      ],
      teardown: { destroyAfterEach: false },
    });

    service = TestBed.inject(QuoteNewService);
  });

  it('should be created with default state', () => {
    expect(service).toBeTruthy();
    expect(service.loaded(), 'state is loaded').toBe(true);
    expect(service.products().length, 'products are loaded').toBe(mockProducts.length);
    expect(service.quote().systems.length, 'quote starts with 1 system').toBe(1);
    expect(service.quote().systems[0].items.length, 'system 1 has no items').toBe(0);
    expect(service.quote().price, 'quote has 0 price').toBe(0);
  });

  it('should add an item to the default system', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;
    const product = mockProducts[0];

    service.addItem$.next({ systemKey, product: product });

    const system1 = service.quote().systems[0];
    const item1 = service.quote().systems[0].items[0];

    expect(system1.items.length, 'system 1 has 1 item').toBe(1);
    expect(item1.itemNumber, 'item number is 1.1').toBe('1.1');
    expect(item1.name, 'item has product name').toBe(product.name);
    expect(item1.description, 'item has product description').toBe(product.description);
    expect(item1.productCode, 'item has default product code').toBe('SKU-RED');
    expect(item1.price, 'item price is greater than 0').toBeGreaterThan(0);
  });

  it('should update the item description', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;
    const itemKey = service.systemItemKeyMap().get(systemKey)![0];
    const currentItem = service.itemMap().get(itemKey)!;
    const newDescription = 'New item description';

    service.updateItem$.next({
      itemKey,
      updatedItem: {
        ...currentItem,
        description: newDescription,
      },
    });

    const updatedItem = service.quote().systems[0].items[0];
    expect(updatedItem.description, 'item description is updated').toBe(newDescription);
  });

  it('should add a second item', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;
    const product = mockProducts[1];

    service.addItem$.next({ systemKey, product: product });

    const system1 = service.quote().systems[0];
    const item2 = service.quote().systems[0].items[1];

    expect(system1.items.length, 'system 1 has 2 items').toBe(2);
    expect(item2.itemNumber, 'item number is 1.2').toBe('1.2');
    expect(item2.name, 'item has product name').toBe(product.name);
    expect(item2.description, 'item has product description').toBe(product.description);
    expect(item2.productCode, 'item has default product code').toBe('SKU-LRG');
    expect(item2.price, 'item price is greater than 0').toBeGreaterThan(0);
  });

  it('should add a third item', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;
    const product = mockProducts[2];

    service.addItem$.next({ systemKey, product: product });

    const system1 = service.quote().systems[0];
    const item3 = service.quote().systems[0].items[2];

    expect(system1.items.length, 'system 1 has 3 items').toBe(3);
    expect(item3.itemNumber, 'item number is 1.3').toBe('1.3');
    expect(item3.name, 'item has product name').toBe(product.name);
    expect(item3.description, 'item has product description').toBe(product.description);
    expect(item3.productCode, 'item has default product code').toBe('SKU-1');
    expect(item3.price, 'item price is greater than 0').toBeGreaterThan(0);
  });

  it('should move the third item to the first position', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;

    service.reorderItem$.next({ systemKey, previousIndex: 2, currentIndex: 0 });

    const product1 = mockProducts[0];
    const product2 = mockProducts[1];
    const product3 = mockProducts[2];

    const item1 = service.quote().systems[0].items[0];
    const item2 = service.quote().systems[0].items[1];
    const item3 = service.quote().systems[0].items[2];

    expect(item1.itemNumber, 'first item number is 1.1').toBe('1.1');
    expect(item2.itemNumber, 'second item number is 1.2').toBe('1.2');
    expect(item3.itemNumber, 'third item is 1.3').toBe('1.3');
    expect(item1.productId, 'first item number is third product').toBe(product3.id);
    expect(item2.productId, 'second item number is first product').toBe(product1.id);
    expect(item3.productId, 'third item is second product').toBe(product2.id);
  });

  it('should add a system to the quote', () => {
    service.addSystem$.next();

    const system1 = service.quote().systems[0];
    const system2 = service.quote().systems[1];

    expect(service.quote().systems.length, 'quote has 2 systems').toBe(2);
    expect(system1.items.length, 'system 1 has 3 items').toBe(3);
    expect(system2.items.length, 'system 2 has 0 items').toBe(0);
  });
});
