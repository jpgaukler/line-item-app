import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../shared/data-access/auth.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';

@Component({
  selector: 'app-profile-edit',
  imports: [CommonModule, ButtonDirective],
  templateUrl: './profile-edit.component.html',
})
export class ProfileEditComponent {
  public readonly authService = inject(AuthService);
  private readonly httpClient = inject(HttpClient);

  constructor() {}

  callApi() {
    this.httpClient.get(`google.com`).subscribe((response) => {
      console.log('Google response:', response);
    });

    this.httpClient.get(`${environment.apiBaseUrl}/api/public`).subscribe((response) => {
      console.log('Public data:', response);
    });

    this.httpClient.get(`${environment.apiBaseUrl}/api/private`).subscribe((response) => {
      console.log('Private data:', response);
    });
  }
}
