import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-layout-topbar',
  imports: [CommonModule],
  templateUrl: './layout-topbar.component.html',
})
export class LayoutTopbarComponent {
  sidebarOpen = input.required<boolean>();
  toggleSidebarClick = output();
}
