import { Component } from '@angular/core';

@Component({
  selector: 'svg[app-icon-hamburger]',
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
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  `,
})
export class IconHamburgerComponent {}
