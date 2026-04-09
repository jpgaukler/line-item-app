import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layout-sidebar',
  imports: [CommonModule],
  templateUrl: './layout-sidebar.component.html',
})
export class LayoutSidebarComponent {
  isOpen = input.required<boolean>();
}
