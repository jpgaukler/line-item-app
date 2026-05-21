import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/data-access/auth.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';

@Component({
  selector: 'app-profile-edit',
  imports: [CommonModule, ButtonDirective],
  templateUrl: './profile-edit.component.html',
})
export class ProfileEditComponent {
  public readonly authService = inject(AuthService);
}
