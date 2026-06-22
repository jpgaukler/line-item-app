import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconHamburgerComponent } from '../../../shared/ui/icons/icon-hamburger.component';
import { LayoutBreadcrumb } from '../../interfaces/layout-breadcrumb.interface';

@Component({
  selector: 'app-layout-topbar',
  imports: [CommonModule, RouterLink, IconHamburgerComponent],
  templateUrl: './layout-topbar.component.html',
})
export class LayoutTopbarComponent {
  sidebarOpen = input.required<boolean>();
  breadcrumbs = input.required<LayoutBreadcrumb[]>();
  toggleAppInformation = output();
  toggleSidebarClick = output();
}
