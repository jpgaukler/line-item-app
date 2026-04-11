import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutService } from './data-access/layout.service';
import { LayoutSidebarComponent } from './ui/layout-sidebar/layout-sidebar.component';
import { LayoutTopbarComponent } from './ui/layout-topbar/layout-topbar.component';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, FormsModule, RouterModule, LayoutSidebarComponent, LayoutTopbarComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements AfterViewInit {
  public layoutService = inject(LayoutService);

  ngAfterViewInit() {
    // Remove the 'no-transition' class after the layout has initialized to enable CSS transitions
    requestAnimationFrame(() => {
      document.body.classList.remove('no-transition');
    });
  }
}
