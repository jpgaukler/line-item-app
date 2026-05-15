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
          useValue: { getProducts: () => of(mockProducts) },
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
    expect(service.quote().systems.length, 'quote has 1 system').toBe(1);
    expect(service.quote().systems[0].items.length, 'system 1 has no items').toBe(0);
  });

  it('should add an item to the default system', async () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;

    service.addItem$.next({ systemKey, product: mockProducts[0] });

    const itemKeys = service.systemItemKeyMap().get(systemKey)!;
    const item = service.itemMap().get(itemKeys[0])!;

    expect(service.quote().systems[0].items.length, 'system 1 has 1 item').toBe(1);
    expect(service.productMap().size, 'product map has 1 product').toBe(1);
    expect(item.productCode, 'item has default product code').toBe('SKU-RED');
  });

  it('should update the item', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;
    const itemKey = service.systemItemKeyMap().get(systemKey)![0];

    service.updateItem$.next({
      itemKey,
      updatedItem: {
        ...service.itemMap().get(itemKey)!,
        description: 'Updated test description',
      },
    });

    const updatedItem = service.itemMap().get(itemKey)!;
    expect(updatedItem.description, 'item description is updated').toBe('Updated test description');
  });

  it('should add a second item', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;
    service.addItem$.next({ systemKey, product: mockProducts[1] });

    const itemKeys = service.systemItemKeyMap().get(systemKey)!;
    const item = service.itemMap().get(itemKeys[1])!;

    expect(service.quote().systems[0].items.length, 'system 1 has 2 items').toBe(2);
    expect(service.itemMap().size, 'item map has 2 items').toBe(2);
    expect(service.productMap().size, 'product map has 2 products').toBe(2);
    expect(item.productCode, 'item has default product code').toBe('SKU-LRG');
  });

  it('should add a third item', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;
    service.addItem$.next({ systemKey, product: mockProducts[2] });

    const itemKeys = service.systemItemKeyMap().get(systemKey)!;
    const item = service.itemMap().get(itemKeys[2])!;

    expect(service.quote().systems[0].items.length, 'system 1 has 3 items').toBe(3);
    expect(service.itemMap().size, 'item map has 3 items').toBe(3);
    expect(service.productMap().size, 'product map has 3 products').toBe(3);
    expect(item.productCode, 'item has default product code').toBe('SKU-1');
  });

  it('should move the third item to the first position', () => {
    const systemKey = service.systemMap().keys().next().value as QuoteSystemKey;
    const keysBefore = service.systemItemKeyMap().get(systemKey)!;
    const thirdItemKey = keysBefore[2];

    service.reorderItem$.next({ systemKey, previousIndex: 2, currentIndex: 0 });

    const keysAfter = service.systemItemKeyMap().get(systemKey)!;
    expect(keysAfter.length, 'item keys length is 3').toBe(3);
    expect(keysAfter[0], 'third item is moved to first position').toBe(thirdItemKey);
    expect(keysAfter[1], 'first item is moved to second position').toBe(keysBefore[0]);
    expect(keysAfter[2], 'second item is moved to third position').toBe(keysBefore[1]);
  });

  it('should add a system to the quote', () => {
    service.addSystem$.next();
    expect(service.quote().systems.length, 'quote has 2 systems').toBe(2);
    expect(service.quote().systems[0].items.length, 'system 1 has 3 items').toBe(3);
    expect(service.quote().systems[1].items.length, 'system 2 has 0 items').toBe(0);
  });
});
