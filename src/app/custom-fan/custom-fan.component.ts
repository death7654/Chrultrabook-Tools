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
  fan_data: string = '';

  data = [
    {
      name: "Default",
      array: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100, 100]
    },
    {
      name: "Aggressive",
      array: [0, 10, 40, 50, 60, 90, 100, 100, 100, 100, 100, 100, 100]
    },
    {
      name: "Quiet",
      array: [0, 15, 20, 30, 40, 55, 90, 100, 100, 100, 100, 100, 100]
    }
]
  fan_curves()
  {
    this.curves = "fan_custom_selected";
    this.profile = ' ';
    this.fan_data = ' '
  }
  fan_profile()
  {
    this.curves = " ";
    this.profile = 'fan_custom_selected';
    this.fan_data = ' '
  }
  fan_data_fn()
  {
    this.curves = " ";
    this.profile = ' ';
    this.fan_data = 'fan_custom_selected'
  }
}
