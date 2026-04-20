import { computed, Directive, input } from '@angular/core';

export type ButtonVariant = 'default' | 'primary' | 'secondary';

@Directive({
  selector: '[appButton]',
  host: {
    '[class]': 'classes()',
  },
})
export class ButtonDirective {
  variant = input<ButtonVariant>('default');

  private readonly baseClasses = [
    'text-sm',
    'font-medium',
    'rounded-lg',
    'p-3',
    'cursor-pointer',
    'transition',
    'disabled:bg-muted',
    'disabled:text-muted-foreground',
  ];

  private readonly variantClassMap: Record<ButtonVariant, string[]> = {
    default: ['border', 'hover:bg-input'],
    primary: ['bg-primary', 'text-primary-foreground', 'hover:bg-primary/80'],
    secondary: ['bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80'],
  };

  readonly classes = computed(() =>
    [...this.baseClasses, ...this.variantClassMap[this.variant()]].join(' '),
  );
}
