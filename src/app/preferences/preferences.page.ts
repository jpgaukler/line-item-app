import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../layout/data-access/layout.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './preferences.page.html',
})
export class PreferencesPage implements OnDestroy {
  public layoutService = inject(LayoutService);

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Preferences', url: '/preferences' },
    ]);
  }

  ngOnDestroy(): void {
    this.layoutService.updateBreadcrumbs$.next([]);
  }
}
