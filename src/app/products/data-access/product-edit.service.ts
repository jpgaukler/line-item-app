import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { AddProductSelectionOption } from '../interfaces/product-selection-option.interface';
import { Product } from '../interfaces/product.interface';

interface ProductEditState {
  product: Product;
  isDirty: boolean;
  loaded: boolean;
  error: string | null;
}

@Injectable()
export class ProductEditService {
  private readonly productHttpService = inject(ProductHttpService);
  private readonly activatedRoute = inject(ActivatedRoute);

  // state
  private state = signal<ProductEditState>({
    product: { id: '', name: '', description: '', productCodeDefinition: '', selections: [] },
    isDirty: false,
    loaded: false,
    error: null,
  });

  // selectors
  product = computed(() => this.state().product);
  name = computed(() => this.state().product.name);
  description = computed(() => this.state().product.description);
  productCodeDefinition = computed(() => this.state().product.productCodeDefinition);
  selections = computed(() => this.state().product.selections);
  isDirty = computed(() => this.state().isDirty);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  private loadProduct$ = this.activatedRoute.paramMap.pipe(
    switchMap((params) => this.productHttpService.getProductById(params.get('productId')!)),
  );
  updateName$ = new Subject<string>();
  updateDescription$ = new Subject<string>();
  addSelection$ = new Subject<void>();
  addOption$ = new Subject<AddProductSelectionOption>();
  updateProductCodeDefinition$ = new Subject<string>();
  saveChanges$ = new Subject<void>();
  discardChanges$ = new Subject<void>();

  constructor() {
    // reducers
    this.loadProduct$.pipe(takeUntilDestroyed()).subscribe({
      next: (product: Product) => {
        this.state.update((state) => ({
          ...state,
          product: product,
          loaded: true,
        }));
      },
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    this.updateName$.pipe(takeUntilDestroyed()).subscribe((name: string) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          name: name,
        },
      })),
    );

    this.updateDescription$.pipe(takeUntilDestroyed()).subscribe((description: string) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          description: description,
        },
      })),
    );

    this.addSelection$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: [
            ...state.product.selections,
            {
              name: `Selection (${state.product.selections.length + 1})`,
              options: [{ displayText: 'Option (1)', value: '1' }],
              defaultValue: 'Option (1)',
              allowCustomValue: false,
            },
          ],
        },
      })),
    );

    this.addOption$
      .pipe(takeUntilDestroyed())
      .subscribe((selectionName: AddProductSelectionOption) =>
        this.state.update((state) => ({
          ...state,
          isDirty: true,
          product: {
            ...state.product,
            selections: state.product.selections.map((selection) =>
              selection.name === selectionName
                ? {
                    ...selection,
                    options: [
                      ...selection.options,
                      {
                        displayText: `Option (${selection.options.length + 1})`,
                        value: `${selection.options.length + 1}`,
                      },
                    ],
                  }
                : selection,
            ),
          },
        })),
      );

    this.updateProductCodeDefinition$
      .pipe(takeUntilDestroyed())
      .subscribe((productCodeDefinition: string) =>
        this.state.update((state) => ({
          ...state,
          isDirty: true,
          product: {
            ...state.product,
            productCodeDefinition: productCodeDefinition,
          },
        })),
      );

    this.saveChanges$
      .pipe(
        takeUntilDestroyed(),
        switchMap(() => this.productHttpService.saveProduct(this.product())),
      )
      .subscribe(() =>
        this.state.update((state) => ({
          ...state,
          isDirty: false,
        })),
      );
  }
}
