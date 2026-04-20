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
    'cursor-pointer',
    'rounded-xl',
    'p-3',
    'transition',
  ];

  private readonly variantClassMap: Record<ButtonVariant, string[]> = {
    default: ['border', 'hover:bg-input', 'disabled:bg-muted', 'disabled:text-muted-foreground'],
    primary: [
      'bg-primary',
      'text-primary-foreground',
      'hover:bg-primary/80',
      'disabled:bg-muted',
      'disabled:text-muted-foreground',
    ],
    secondary: [
      'bg-secondary',
      'text-secondary-foreground',
      'hover:bg-secondary/80',
      'disabled:bg-muted',
      'disabled:text-muted-foreground',
    ],
  };

  readonly classes = computed(() =>
    [...this.baseClasses, ...this.variantClassMap[this.variant()]].join(' '),
  );
}
