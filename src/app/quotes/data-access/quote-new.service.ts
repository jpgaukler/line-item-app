import { moveItemInArray } from '@angular/cdk/drag-drop';
import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { Product } from '../../products/interfaces/product.interface';
import { calculateProductCode } from '../../products/utils/product-utils';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { QuoteItemInput } from '../interfaces/quote-item-input.interface';
import { QuoteItem, QuoteItemKey } from '../interfaces/quote-item.interface';
import { QuoteModel } from '../interfaces/quote-model.interface';
import { QuoteSystem, QuoteSystemKey } from '../interfaces/quote-system.interface';

interface QuoteNewState {
  /** User defined name for the quote */
  name: string;

  /** Name of the customer for whom the quote is for. */
  customerName: string;

  /** Email of the customer for whom the quote is for. */
  customerEmail: string;

  /** A Map of random string keys to QuoteSystems */
  systemMap: Map<QuoteSystemKey, QuoteSystem>;

  /** The system key where an item is being added, otherwise null */
  showAddItem: QuoteSystemKey | null;

  /** A Map of system keys to array of item keys for the quote items in each system. */
  systemItemKeyMap: Map<QuoteSystemKey, QuoteItemKey[]>;

  /** A Map of random string keys to QuoteItems for easy lookups. */
  itemMap: Map<QuoteItemKey, QuoteItem>;

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
        systemMap: new Map<QuoteSystemKey, QuoteSystem>([[systemKey, { price: 0 }]]),
        showAddItem: null,
        systemItemKeyMap: new Map<QuoteSystemKey, QuoteItemKey[]>([[systemKey, []]]),
        itemMap: new Map<QuoteItemKey, QuoteItem>(),
        loaded: false,
        error: null,
      };
    })(),
  );

  // selectors
  products = computed(() =>
    [...this.state().products].sort((a, b) => a.name.localeCompare(b.name)),
  );
  productMap = computed(() => this.state().productMap);
  systemMap = computed(() => this.state().systemMap);
  showAddItem = computed(() => this.state().showAddItem);
  systemItemKeyMap = computed(() => this.state().systemItemKeyMap);
  itemMap = computed(() => this.state().itemMap);
  quote = computed(() => {
    const state = this.state();

    const systems = Array.from(state.systemMap.entries(), ([systemKey, system], systemIndex) => {
      const systemItemKeyMap = state.systemItemKeyMap.get(systemKey)!;

      return {
        price: systemItemKeyMap.reduce((total, itemKey) => {
          const item = state.itemMap.get(itemKey)!;
          return total + item.price * item.quantity;
        }, 0),
        name: `System ${systemIndex + 1}`,
        items: systemItemKeyMap.map((itemKey, itemIndex) => {
          const item = state.itemMap.get(itemKey)!;
          return {
            productId: item.productId,
            itemNumber: `${systemIndex + 1}.${itemIndex + 1}`,
            name: item.name,
            description: item.description,
            productCode: item.productCode,
            price: item.price,
            quantity: item.quantity,
            inputs: item.inputs.map((input) => ({
              name: input.name,
              value: input.value,
              displayText: input.displayText,
            })),
          };
        }),
      };
    });

    const quote: QuoteModel = {
      name: state.name,
      customerName: state.customerName,
      customerEmail: state.customerEmail,
      systems: systems,
      price: systems.reduce((total, system) => total + system.price, 0),
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
  showAddItem$ = new Subject<QuoteSystemKey>();
  addItem$ = new Subject<{ systemKey: QuoteSystemKey; product: Product }>();
  updateItem$ = new Subject<{
    itemKey: QuoteItemKey;
    updatedItem: QuoteItem;
  }>();
  removeItem$ = new Subject<{
    systemKey: QuoteSystemKey;
    itemKey: QuoteItemKey;
  }>();
  reorderSystem$ = new Subject<{ previousIndex: number; currentIndex: number }>();
  reorderItem$ = new Subject<{
    systemKey: QuoteSystemKey;
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
        const newSystemKey: QuoteSystemKey = crypto.randomUUID();
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

    this.showAddItem$.pipe(takeUntilDestroyed()).subscribe((next: QuoteSystemKey) => {
      this.state.update((state) => ({
        ...state,
        showAddItem: next,
      }));
    });

    this.addItem$
      .pipe(
        map((next) => {
          const defaultInputs: QuoteItemInput[] = next.product.inputs.map((input) => ({
            name: input.name,
            value: input.options[input.defaultOptionIndex].value,
            displayText: input.options[input.defaultOptionIndex].displayText,
          }));
          const productCode: string = calculateProductCode(
            next.product,
            Object.fromEntries(defaultInputs.map((input) => [input.name, input.value])),
          );
          return { ...next, defaultInputs, productCode };
        }),
        switchMap((next) =>
          this.productHttpService.getProductPrice(next.product.id, next.productCode).pipe(
            map((price) => ({ ...next, price })),
            catchError((err) => {
              // if no price match found (ie: -X product), then need to decide what to do.
              // Maybe user should enter manual price?
              console.error('Error getting price', err);
              return of({ ...next, price: 0 });
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((next) => {
        this.state.update((state) => {
          const newItemKey: QuoteItemKey = crypto.randomUUID();
          const newItem: QuoteItem = {
            productId: next.product.id,
            name: next.product.name,
            description: next.product.description,
            productCode: next.productCode,
            price: next.price,
            quantity: 1,
            inputs: next.defaultInputs,
          };

          const itemKeys: QuoteItemKey[] = state.systemItemKeyMap.get(next.systemKey)!;
          const updatedItemKeys: QuoteItemKey[] = [...itemKeys, newItemKey];

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

    this.updateItem$
      .pipe(
        switchMap((next) =>
          this.productHttpService
            .getProductPrice(next.updatedItem.productId, next.updatedItem.productCode)
            .pipe(
              map((price) => ({ ...next, updatedItem: { ...next.updatedItem, price: price } })),
              catchError((err) => {
                // if no price match found (ie: -X product), then need to decide what to do.
                // Maybe user should enter manual price?
                console.error('Error getting price', err);
                return of(next);
              }),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (next) => {
          this.state.update((state) => ({
            ...state,
            itemMap: new Map([...state.itemMap, [next.itemKey, { ...next.updatedItem }]]),
          }));
        },
        error: (err) => this.state.update((state) => ({ ...state, error: err })),
      });

    this.reorderItem$
      .pipe(
        filter((next) => next.previousIndex !== next.currentIndex),
        takeUntilDestroyed(),
      )
      .subscribe(
        (next: { systemKey: QuoteSystemKey; previousIndex: number; currentIndex: number }) => {
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
        },
      );

    this.removeItem$.pipe(takeUntilDestroyed()).subscribe((next) => {
      this.state.update((state) => {
        const itemKeys: QuoteItemKey[] = state.systemItemKeyMap.get(next.systemKey)!;
        const updatedItemKeys: QuoteItemKey[] = itemKeys.filter((key) => key !== next.itemKey);

        const updatedItemMap = new Map(state.itemMap);
        updatedItemMap.delete(next.itemKey);

        return {
          ...state,
          systemItemKeyMap: new Map([...state.systemItemKeyMap, [next.systemKey, updatedItemKeys]]),
          itemMap: updatedItemMap,
        };
      });
    });
  }
}
