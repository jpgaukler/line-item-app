import { Component } from '@angular/core';

@Component({
  selector: 'svg[app-icon-checkmark]',
  host: {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '2',
    stroke: 'currentColor',
  },
  template: `
    <svg:path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  `,
})
export class IconCheckmarkComponent {}
