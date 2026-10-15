import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-custom-fan",
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./custom-fan.component.html",
  styleUrl: "./custom-fan.component.scss",
})
export class CustomFanComponent {}
