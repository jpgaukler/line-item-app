import { Component } from '@angular/core';

@Component({
  selector: 'svg[app-icon-drag-handle]',
  host: {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '2',
    stroke: 'currentColor',
  },
  template: `
    <svg:path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"
    />
  `,
})
export class IconDragHandleComponent {}
