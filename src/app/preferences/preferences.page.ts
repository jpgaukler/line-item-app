import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../layout/data-access/layout.service';
import { IconComputerDesktopComponent } from '../shared/ui/icons/icon-computer-desktop.component';
import { IconMoonComponent } from '../shared/ui/icons/icon-moon.component';
import { IconSunComponent } from '../shared/ui/icons/icon-sun.component';

@Component({
  selector: 'app-products',
  imports: [
    FormsModule,
    RouterModule,
    IconSunComponent,
    IconMoonComponent,
    IconComputerDesktopComponent,
  ],
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
