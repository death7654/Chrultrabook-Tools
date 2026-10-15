import { Component } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { zoomScale } from "../../services/device";
@Component({
  selector: "app-extra-section", imports: [],
  templateUrl: "./extra-section.component.html", styleUrl: "./extra-section.component.scss",
})
export class ExtraSectionComponent {
  private async open(name: string, width: number, height: number) {
    try {
      const value = await invoke<string>("local_storage", { function: "get", option: "zoom", value: "" });
      await invoke("open_window", { name, width, height, zoom: zoomScale(value) });
    } catch (error) { console.error("open window:", error); }
  }
  diagnostic() { return this.open("Diagnostics", 760, 510); }
  settings() { return this.open("Settings", 600, 450); }
  keyboard() { return this.open("Keyboard_extra", 1100, 600); }
  battery() { return this.open("Battery", 700, 350); }
}
