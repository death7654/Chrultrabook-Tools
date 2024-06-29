import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-custom-fan",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./custom-fan.component.html",
  styleUrl: "./custom-fan.component.scss",
})
export class CustomFanComponent {
  curves: string = "active";
  profile: string = "";
  data: string = "";

  refresh() {
    window.location.reload();
  }

  removeActive()
  {
    this.curves = " "
    this.profile = " "
    this.data = " "
  }

  fan_curves() {
    this.removeActive();
    this.curves = "active";
  }
  fan_profile() {
    this.removeActive()
    this.profile = "active";
  }
  fan_data_fn() {
    this.removeActive()
    this.data = "active";
  }
}
