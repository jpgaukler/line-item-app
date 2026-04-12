import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appButtonPrimary]',
})
export class ButtonPrimaryDirective {
  @HostBinding('class')
  classes = [
    'bg-primary',
    'text-primary-foreground',
    'hover:bg-primary/80',
    'disabled:bg-muted',
    'disabled:text-muted-foreground',
    'cursor-pointer',
    'rounded-md',
    'p-2',
    'font-medium',
  ].join(' ');
}
