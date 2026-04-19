import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-layout-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './layout-sidebar.component.html',
})
export class LayoutSidebarComponent {
  isOpen = input.required<boolean>();
  menuItems: MenuItem[] = [
    { label: 'Products', route: '/products' },
    { label: 'New Quote', route: '/quotes/new' },
    { label: 'Preferences', route: '/preferences' },
  ];
}
