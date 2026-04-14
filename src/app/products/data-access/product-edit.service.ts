import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap, tap } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
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

  updateProductName$ = new Subject<string>();
  updateProductDescription$ = new Subject<string>();
  updateProductCodeDefinition$ = new Subject<string>();

  addSelection$ = new Subject<void>();
  removeSelection$ = new Subject<{ selectionId: string }>();
  updateSelectionName$ = new Subject<{ selectionId: string; name: string }>();
  updateSelectionAllowCustomValue$ = new Subject<{
    selectionId: string;
    allowCustomValue: boolean;
  }>();
  updateSelectionDefaultOptionId$ = new Subject<{ selectionId: string; defaultOptionId: string }>();

  addOption$ = new Subject<{ selectionId: string }>();
  removeOption$ = new Subject<{ selectionId: string; optionId: string }>();
  updateOptionDisplayText$ = new Subject<{
    selectionId: string;
    optionId: string;
    displayText: string;
  }>();
  updateOptionValue$ = new Subject<{
    selectionId: string;
    optionId: string;
    value: string;
  }>();

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

    this.updateProductName$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          name: next,
        },
      })),
    );

    this.updateProductDescription$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          description: next,
        },
      })),
    );

    this.addSelection$.pipe(takeUntilDestroyed()).subscribe(() => {
      const defaultOptionId = crypto.randomUUID();

      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: [
            ...state.product.selections,
            {
              id: crypto.randomUUID(),
              name: `Selection (${state.product.selections.length + 1})`,
              options: [{ id: defaultOptionId, displayText: 'Option (1)', value: '1' }],
              defaultOptionId: defaultOptionId,
              allowCustomValue: false,
            },
          ],
        },
      }));
    });

    this.removeSelection$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: state.product.selections.filter(
            (selection) => selection.id !== next.selectionId,
          ),
        },
      })),
    );

    this.updateSelectionName$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: state.product.selections.map((selection) =>
            selection.id === next.selectionId
              ? {
                  ...selection,
                  name: next.name,
                }
              : selection,
          ),
        },
      })),
    );

    this.updateSelectionDefaultOptionId$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: state.product.selections.map((selection) =>
            selection.id === next.selectionId
              ? {
                  ...selection,
                  defaultOptionId: next.defaultOptionId,
                }
              : selection,
          ),
        },
      })),
    );

    this.updateSelectionAllowCustomValue$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: state.product.selections.map((selection) =>
            selection.id === next.selectionId
              ? {
                  ...selection,
                  allowCustomValue: next.allowCustomValue,
                }
              : selection,
          ),
        },
      })),
    );

    this.addOption$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: state.product.selections.map((selection) =>
            selection.id === next.selectionId
              ? {
                  ...selection,
                  options: [
                    ...selection.options,
                    {
                      id: crypto.randomUUID(),
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

    this.removeOption$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: state.product.selections.map((selection) =>
            selection.id === next.selectionId
              ? {
                  ...selection,
                  options: selection.options.filter((option) => option.id !== next.optionId),
                }
              : selection,
          ),
        },
      })),
    );

    this.updateOptionDisplayText$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: state.product.selections.map((selection) =>
            selection.id === next.selectionId
              ? {
                  ...selection,
                  options: [
                    ...selection.options.map((option) =>
                      option.id === next.optionId
                        ? { ...option, displayText: next.displayText }
                        : option,
                    ),
                  ],
                }
              : selection,
          ),
        },
      })),
    );

    this.updateOptionValue$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          selections: state.product.selections.map((selection) =>
            selection.id === next.selectionId
              ? {
                  ...selection,
                  options: [
                    ...selection.options.map((option) =>
                      option.id === next.optionId ? { ...option, value: next.value } : option,
                    ),
                  ],
                }
              : selection,
          ),
        },
      })),
    );

    this.updateProductCodeDefinition$.pipe(takeUntilDestroyed()).subscribe((next) =>
      this.state.update((state) => ({
        ...state,
        isDirty: true,
        product: {
          ...state.product,
          productCodeDefinition: next,
        },
      })),
    );

    this.saveChanges$
      .pipe(
        takeUntilDestroyed(),
        switchMap(() => this.productHttpService.saveProduct(this.product())),
        tap(() => {
          console.log('Product saved successfully', this.product());
        }),
      )
      .subscribe(() =>
        this.state.update((state) => ({
          ...state,
          isDirty: false,
        })),
      );
  }
}
