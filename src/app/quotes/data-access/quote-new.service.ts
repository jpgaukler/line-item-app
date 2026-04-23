import { moveItemInArray } from '@angular/cdk/drag-drop';
import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Subject } from 'rxjs';
import { Product } from '../../products/interfaces/product.interface';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { QuoteItemSelection } from '../interfaces/quote-item-selection.interface';
import { ItemKey, QuoteItem } from '../interfaces/quote-item.interface';
import { QuoteSystem, SystemKey } from '../interfaces/quote-system.interface';
import { QuoteModel } from '../interfaces/quote.interface';

// type ProductKey = `${string}::${number}`;

// export const toProductKey = (productId: string, version: number) => `${productId}::${version}`;

interface QuoteNewState {
  /** User defined name for the quote */
  name: string;

  /** Name of the customer for whom the quote is for. */
  customerName: string;

  /** Email of the customer for whom the quote is for. */
  customerEmail: string;

  /** A Map of random string keys to QuoteSystems */
  systemMap: Map<SystemKey, QuoteSystem>;

  /** The system key where an item is being added, otherwise null */
  showAddItem: SystemKey | null;

  /** A Map of system keys to array of item keys for the quote items in each system. */
  systemItemKeyMap: Map<SystemKey, ItemKey[]>;

  /** A Map of random string keys to QuoteItems for easy lookups. */
  itemMap: Map<ItemKey, QuoteItem>;

  /** List of product definitions for use when adding a new quote item. */
  products: Product[];

  /** A Map of product ids to their corresponding product definitions for easy lookups */
  productMap: Map<string, Product>;

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
      const systemKey = crypto.randomUUID();

      return {
        products: [],
        productMap: new Map<string, Product>(),
        name: '',
        customerName: '',
        customerEmail: '',
        systemMap: new Map<SystemKey, QuoteSystem>([[systemKey, { price: 0 }]]),
        showAddItem: null,
        systemItemKeyMap: new Map<SystemKey, ItemKey[]>([[systemKey, []]]),
        itemMap: new Map<ItemKey, QuoteItem>(),
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
  systemItemKeyMap = computed(() => this.state().systemItemKeyMap);
  itemMap = computed(() => this.state().itemMap);
  quote = computed(() => {
    const quote: QuoteModel = {
      name: this.state().name,
      customerName: this.state().customerName,
      customerEmail: this.state().customerEmail,
      systems: Array.from(this.state().systemMap.entries(), ([systemKey, system], systemIndex) => ({
        price: system.price,
        name: `System ${systemIndex + 1}`,
        items: this.state()
          .systemItemKeyMap.get(systemKey)!
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
  showAddItem$ = new Subject<SystemKey>();
  addItem$ = new Subject<{ systemKey: SystemKey; product: Product }>();
  updateItemSelection$ = new Subject<{ itemKey: ItemKey; updatedSelection: QuoteItemSelection }>();
  reorderSystem$ = new Subject<{ previousIndex: number; currentIndex: number }>();
  reorderItem$ = new Subject<{
    systemKey: SystemKey;
    previousIndex: number;
    currentIndex: number;
  }>();

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
        const newSystemKey: SystemKey = crypto.randomUUID();
        const newSystem: QuoteSystem = {
          price: 0,
        };

        return {
          ...state,
          systemMap: new Map([...state.systemMap, [newSystemKey, newSystem]]),
          systemItemKeyMap: new Map([...state.systemItemKeyMap, [newSystemKey, []]]),
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

    this.showAddItem$.pipe(takeUntilDestroyed()).subscribe((next: SystemKey) => {
      this.state.update((state) => ({
        ...state,
        showAddItem: next,
      }));
    });

    this.addItem$
      .pipe(takeUntilDestroyed())
      .subscribe((next: { systemKey: SystemKey; product: Product }) => {
        this.state.update((state) => {
          const newItemKey: ItemKey = crypto.randomUUID();
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

          const itemKeys: ItemKey[] = state.systemItemKeyMap.get(next.systemKey)!;
          const updatedItemKeys: ItemKey[] = [...itemKeys, newItemKey];

          return {
            ...state,
            showAddItem: null,
            productMap: new Map([...state.productMap, [next.product.id, next.product]]),
            systemItemKeyMap: new Map([
              ...state.systemItemKeyMap,
              [next.systemKey, updatedItemKeys],
            ]),
            itemMap: new Map([...state.itemMap, [newItemKey, newItem]]),
          };
        });
      });

    this.updateItemSelection$
      .pipe(takeUntilDestroyed())
      .subscribe((next: { itemKey: ItemKey; updatedSelection: QuoteItemSelection }) => {
        this.state.update((state) => {
          const item: QuoteItem = state.itemMap.get(next.itemKey)!;
          const updatedItem: QuoteItem = {
            ...item,
            selections: item.selections.map((selection) =>
              selection.name === next.updatedSelection.name ? next.updatedSelection : selection,
            ),
          };

          return {
            ...state,
            itemMap: new Map([...state.itemMap, [next.itemKey, updatedItem]]),
          };
        });
      });

    this.reorderItem$
      .pipe(
        takeUntilDestroyed(),
        filter((next) => next.previousIndex !== next.currentIndex),
      )
      .subscribe((next: { systemKey: SystemKey; previousIndex: number; currentIndex: number }) => {
        this.state.update((state) => {
          const itemKeys = state.systemItemKeyMap.get(next.systemKey)!;
          const updatedItemKeys = [...itemKeys];
          moveItemInArray(updatedItemKeys, next.previousIndex, next.currentIndex);

          return {
            ...state,
            systemItemKeyMap: new Map([
              ...state.systemItemKeyMap,
              [next.systemKey, updatedItemKeys],
            ]),
          };
        });
      });
  }
}
