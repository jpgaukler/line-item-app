import { moveItemInArray } from '@angular/cdk/drag-drop';
import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Subject } from 'rxjs';
import { Product } from '../../products/interfaces/product.interface';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { QuoteItemSelection } from '../interfaces/quote-item-selection.interface';
import { QuoteItem } from '../interfaces/quote-item.interface';
import { QuoteSystem } from '../interfaces/quote-system.interface';
import { Quote } from '../interfaces/quote.interface';

// type ProductKey = `${string}::${number}`;

// export const toProductKey = (productId: string, version: number) => `${productId}::${version}`;

interface QuoteNewState {
  products: Product[];
  productMap: Map<string, Product>;

  name: string;
  customerName: string;
  customerEmail: string;

  systemMap: Map<string, QuoteSystem>;
  showAddItem: string | null;
  systemItemIdMap: Map<string, string[]>;
  itemMap: Map<string, QuoteItem>;

  loaded: boolean;
  error: string | null;
}

@Injectable()
export class QuoteNewService {
  private readonly productHttpService = inject(ProductHttpService);

  nameControl = new FormControl<string>('', { nonNullable: true });
  customerNameControl = new FormControl<string>('', { nonNullable: true });
  customerEmailControl = new FormControl<string>('', { nonNullable: true });

  // state
  private state = signal<QuoteNewState>(
    (() => {
      const systemId = crypto.randomUUID();

      return {
        products: [],
        productMap: new Map<string, Product>(),
        name: '',
        customerName: '',
        customerEmail: '',
        systemMap: new Map<string, QuoteSystem>([[systemId, { price: 0 }]]),
        showAddItem: null,
        systemItemIdMap: new Map<string, string[]>([[systemId, []]]),
        itemMap: new Map<string, QuoteItem>(),
        loaded: false,
        error: null,
      };
    })(),
  );

  // selectors
  products = computed(() => this.state().products.sort((a, b) => a.name.localeCompare(b.name)));
  productMap = computed(() => this.state().productMap);

  systemMap = computed(() => this.state().systemMap);
  showAddItem = computed(() => this.state().showAddItem);
  systemItemIdMap = computed(() => this.state().systemItemIdMap);
  itemMap = computed(() => this.state().itemMap);
  quote = computed(() => {
    const quote: Quote = {
      name: this.state().name,
      customerName: this.state().customerName,
      customerEmail: this.state().customerEmail,
      systems: Array.from(this.state().systemMap.entries(), ([systemKey, system], systemIndex) => ({
        price: system.price,
        name: `System ${systemIndex + 1}`,
        items: this.state()
          .systemItemIdMap.get(systemKey)!
          .map((itemKey) => this.state().itemMap.get(itemKey)!)
          .map((item, itemIndex) => ({
            productId: item.productId,
            itemNumber: `${systemIndex + 1}.${itemIndex + 1}`,
            name: item.name,
            description: item.description,
            productCode: item.productCode,
            price: 0,
            selections: item.selections.map((selection) => ({
              name: selection.name,
              value: selection.value,
              displayText: selection.displayText,
              isCustomValue: selection.isCustomValue,
            })),
          })),
      })),
      price: 0,
    };
    return quote;
  });

  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  private productsLoaded$ = this.productHttpService.getProducts();
  private nameControlChanges$ = this.nameControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  );
  private customerNameControlChanges$ = this.customerNameControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  );
  private customerEmailControlChanges$ = this.customerEmailControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  );

  addSystem$ = new Subject<void>();
  showAddItem$ = new Subject<{ systemId: string }>();
  addItem$ = new Subject<{ systemId: string; product: Product }>();
  updateItemSelection$ = new Subject<{ itemId: string; updatedSelection: QuoteItemSelection }>();
  reorderSystem$ = new Subject<{ previousIndex: number; currentIndex: number }>();
  reorderItem$ = new Subject<{ systemId: string; previousIndex: number; currentIndex: number }>();

  constructor() {
    // reducers
    this.productsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (products: Product[]) =>
        this.state.update((state) => ({
          ...state,
          products: products,
          loaded: true,
        })),
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    this.nameControlChanges$.pipe(takeUntilDestroyed()).subscribe((next: string) =>
      this.state.update((state) => ({
        ...state,
        name: next,
      })),
    );

    this.customerNameControlChanges$.pipe(takeUntilDestroyed()).subscribe((next: string) =>
      this.state.update((state) => ({
        ...state,
        customerName: next,
      })),
    );

    this.customerEmailControlChanges$.pipe(takeUntilDestroyed()).subscribe((next: string) =>
      this.state.update((state) => ({
        ...state,
        customerEmail: next,
      })),
    );

    this.addSystem$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => {
        const newSystemId: string = crypto.randomUUID();
        const newSystem: QuoteSystem = {
          price: 0,
        };

        return {
          ...state,
          systemMap: new Map([...state.systemMap, [newSystemId, newSystem]]),
          systemItemIdMap: new Map([...state.systemItemIdMap, [newSystemId, []]]),
        };
      }),
    );

    this.reorderSystem$
      .pipe(
        takeUntilDestroyed(),
        filter((next) => next.previousIndex !== next.currentIndex),
      )
      .subscribe((next: { previousIndex: number; currentIndex: number }) => {
        this.state.update((state) => {
          const entries = Array.from(state.systemMap.entries());
          moveItemInArray(entries, next.previousIndex, next.currentIndex);

          return {
            ...state,
            systemMap: new Map(entries),
          };
        });
      });

    this.showAddItem$.pipe(takeUntilDestroyed()).subscribe((next: { systemId: string }) => {
      this.state.update((state) => ({
        ...state,
        showAddItem: next.systemId,
      }));
    });

    this.addItem$
      .pipe(takeUntilDestroyed())
      .subscribe((next: { systemId: string; product: Product }) => {
        this.state.update((state) => {
          const newItemId: string = crypto.randomUUID();
          const newItem: QuoteItem = {
            productId: next.product.id,
            name: next.product.name,
            description: next.product.description,
            productCode: next.product.productCodeDefinition,
            price: 0,
            selections: next.product.selections.map((selection) => ({
              name: selection.name,
              value: selection.options[selection.defaultOptionIndex].value,
              displayText: selection.options[selection.defaultOptionIndex].displayText,
              isCustomValue: false,
            })),
          };

          const itemIds: string[] = state.systemItemIdMap.get(next.systemId)!;
          const updatedItemIds: string[] = [...itemIds, newItemId];

          return {
            ...state,
            showAddItem: null,
            productMap: new Map([...state.productMap, [next.product.id, next.product]]),
            systemItemIdMap: new Map([...state.systemItemIdMap, [next.systemId, updatedItemIds]]),
            itemMap: new Map([...state.itemMap, [newItemId, newItem]]),
          };
        });
      });

    this.updateItemSelection$
      .pipe(takeUntilDestroyed())
      .subscribe((next: { itemId: string; updatedSelection: QuoteItemSelection }) => {
        this.state.update((state) => {
          const item: QuoteItem = state.itemMap.get(next.itemId)!;
          const updatedItem: QuoteItem = {
            ...item,
            selections: item.selections.map((selection) =>
              selection.name === next.updatedSelection.name ? next.updatedSelection : selection,
            ),
          };

          return {
            ...state,
            itemMap: new Map([...state.itemMap, [next.itemId, updatedItem]]),
          };
        });
      });

    this.reorderItem$
      .pipe(
        takeUntilDestroyed(),
        filter((next) => next.previousIndex !== next.currentIndex),
      )
      .subscribe((next: { systemId: string; previousIndex: number; currentIndex: number }) => {
        this.state.update((state) => {
          const itemIds = state.systemItemIdMap.get(next.systemId)!;
          const updatedItemIds = [...itemIds];
          moveItemInArray(updatedItemIds, next.previousIndex, next.currentIndex);

          return {
            ...state,
            systemItemIdMap: new Map([...state.systemItemIdMap, [next.systemId, updatedItemIds]]),
          };
        });
      });
  }
}
