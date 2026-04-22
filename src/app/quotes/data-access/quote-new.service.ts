import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Product } from '../../products/interfaces/product.interface';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { QuoteItemSelection } from '../interfaces/quote-item-selection.interface';
import { QuoteItem } from '../interfaces/quote-item.interface';
import { QuoteSystem } from '../interfaces/quote-system.interface';

// type ProductKey = `${string}::${number}`;

// export const toProductKey = (productId: string, version: number) => `${productId}::${version}`;

interface QuoteNewState {
  products: Product[];
  productMap: Map<string, Product>;

  quoteName: string;
  customerName: string;
  customerEmail: string;

  systemMap: Map<string, QuoteSystem>;
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
  private state = signal<QuoteNewState>({
    products: [],
    productMap: new Map<string, Product>(),
    quoteName: '',
    customerName: '',
    customerEmail: '',
    systemMap: new Map<string, QuoteSystem>([
      [
        crypto.randomUUID(),
        {
          price: 0,
          itemIds: [],
        },
      ],
    ]),
    itemMap: new Map<string, QuoteItem>(),
    loaded: false,
    error: null,
  });

  // selectors
  // quote = computed(() => this.state().quote);
  products = computed(() => this.state().products.sort((a, b) => a.name.localeCompare(b.name)));
  productMap = computed(() => this.state().productMap);

  systemMap = computed(() => this.state().systemMap);
  itemMap = computed(() => this.state().itemMap);

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

  addItem$ = new Subject<{ systemId: string; product: Product }>();
  updateItemSelection$ = new Subject<{
    itemId: string;
    updatedSelection: QuoteItemSelection;
  }>();
  addSystem$ = new Subject<void>();

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
        quoteName: next,
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
          itemIds: [],
        };

        return {
          ...state,
          systemMap: new Map([...state.systemMap, [newSystemId, newSystem]]),
        };
      }),
    );

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
          const system: QuoteSystem = state.systemMap.get(next.systemId)!;
          const updateSystem: QuoteSystem = {
            ...system,
            itemIds: [...system.itemIds, newItemId],
          };

          return {
            ...state,
            productMap: new Map([...state.productMap, [next.product.id, next.product]]),
            systemMap: new Map([...state.systemMap, [next.systemId, updateSystem]]),
            itemMap: new Map([...state.itemMap, [newItemId, newItem]]),
          };
        });
      });

    this.updateItemSelection$
      .pipe(takeUntilDestroyed())
      .subscribe((next: { itemId: string; updatedSelection: QuoteItemSelection }) => {
        // this.state.update((state) => ({
        //   ...state,
        //   itemMap: {
        //     ...state.itemMap,
        //     [next.itemId]: {
        //       ...state.itemMap[next.itemId],
        //       selections: state.itemMap[next.itemId].selections.map((selection) =>
        //         next.updatedSelection.name === selection.name ? next.updatedSelection : selection,
        //       ),
        //     },
        //   },
        // }));
      });
  }
}
