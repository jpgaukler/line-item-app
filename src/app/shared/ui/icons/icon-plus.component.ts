import { Component } from '@angular/core';

@Component({
  selector: 'svg[app-icon-plus]',
  host: {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '2',
    stroke: 'currentColor',
  },
  template: `
    <svg:path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  `,
})
export class IconPlusComponent {}
