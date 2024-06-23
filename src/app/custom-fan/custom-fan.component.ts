import { Component } from "@angular/core"
import { ButtonComponent } from "../button/button.component"
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: "app-custom-fan",
  standalone: true,
  imports: [ButtonComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./custom-fan.component.html",
  styleUrl: "./custom-fan.component.scss",
})
export class CustomFanComponent {
  curves: string = '';
  profile: string = '';
  data: string = '';

  refresh()
  {
    window.location.reload()
  }

  fan_curves()
  {
    this.curves = "fan_custom_selected";
    this.profile = ' ';
    this.data = ' '
  }
  fan_profile()
  {
    this.curves = " ";
    this.profile = 'fan_custom_selected';
    this.data = ' '
  }
  fan_data_fn()
  {
    this.curves = " ";
    this.profile = ' ';
    this.data = 'fan_custom_selected'
  }
}
