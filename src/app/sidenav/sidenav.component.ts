import { Component } from '@angular/core';
import { navBarData } from './nav-data';




@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {

  collapsed = false;
  navData = navBarData;
}
