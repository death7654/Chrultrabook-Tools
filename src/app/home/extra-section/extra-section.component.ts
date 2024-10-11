import { Component } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-extra-section",
  standalone: true,
  imports: [],
  templateUrl: "./extra-section.component.html",
  styleUrl: "./extra-section.component.scss",
})
export class ExtraSectionComponent {
  diagnostic() {
    console.log("diag");
    invoke("open_window", { name: "Diagnostics", width: 660.0, height: 410.0 });
  }
  settings() {
    console.log("settings");
    invoke("open_window", { name: "Settings", width: 500.0, height: 350.0 });
  }
}
