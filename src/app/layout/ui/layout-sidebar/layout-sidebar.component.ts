import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './layout-sidebar.component.html',
})
export class LayoutSidebarComponent {
  isOpen = input.required<boolean>();
}
