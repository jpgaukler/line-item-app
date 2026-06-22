import { Component } from '@angular/core';

@Component({
  selector: 'svg[app-icon-x-mark]',
  host: {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '2',
    stroke: 'currentColor',
  },
  template: `
    <svg:path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
  `,
})
export class IconXmarkComponent {}
