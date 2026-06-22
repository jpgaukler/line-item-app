import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';

/**
 * The BUILD_VERSION constant is injected at build time with --define. See Github Actions workflow.
 */
declare const BUILD_VERSION: string;

@Component({
  selector: 'app-layout-information',
  imports: [CommonModule, ButtonDirective],
  templateUrl: './layout-information.component.html',
})
export class LayoutInformationComponent {
  isOpen = input.required<boolean>();
  toggleAppInformation = output();
  buildVersion = BUILD_VERSION;
}
