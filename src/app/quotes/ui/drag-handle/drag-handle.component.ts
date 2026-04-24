import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';

@Component({
  selector: 'app-drag-handle',
  imports: [CdkDragHandle],
  templateUrl: './drag-handle.component.html',
})
export class DragHandleComponent {}
