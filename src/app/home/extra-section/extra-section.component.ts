import { Component } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-extra-section",
  imports: [],
  templateUrl: "./extra-section.component.html",
  styleUrl: "./extra-section.component.scss"
})
export class ExtraSectionComponent {
  zoom: number = 1;
  ngOnInit() {
    invoke("local_storage", {
      function: "get",
      option: "zoom",
      value: "",
    }).then((percentage) => {
      if (typeof percentage === "string") {
        const number = Number(percentage) / 100;
        this.zoom = number;
        console.log(this.zoom)
      }
    });
  }
  diagnostic() {
    console.log("diag");
    invoke("open_window", { name: "Diagnostics", width: 760.0, height: 510.0, zoom: this.zoom });
  }
  settings() {
    console.log("settings");
    invoke("open_window", { name: "Settings", width: 600.0, height: 450.0, zoom: this.zoom });
  }
}
