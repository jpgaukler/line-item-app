import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-layout-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './layout-sidebar.component.html',
})
export class LayoutSidebarComponent {
  isOpen = input.required<boolean>();
  menuItems: MenuItem[] = [
    { label: 'Products', route: '/products' },
    { label: 'Item 2', route: '/' },
  ];
}
