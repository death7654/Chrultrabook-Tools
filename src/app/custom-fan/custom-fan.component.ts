import { Component } from "@angular/core"
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: "app-custom-fan",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./custom-fan.component.html",
  styleUrl: "./custom-fan.component.scss",
})
export class CustomFanComponent {
  curves: string = 'active';
  profile: string = '';
  data: string = '';

  refresh()
  {
    window.location.reload()
  }

  fan_curves()
  {
    this.curves = "active";
    this.profile = ' ';
    this.data = ' '
  }
  fan_profile()
  {
    this.curves = " ";
    this.profile = 'active';
    this.data = ' '
  }
  fan_data_fn()
  {
    this.curves = " ";
    this.profile = ' ';
    this.data = 'active'
  }
}
