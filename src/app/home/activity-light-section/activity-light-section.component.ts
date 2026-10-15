import { Component, OnDestroy, OnInit } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
@Component({
  selector: "app-activity-light-section", imports: [],
  templateUrl: "./activity-light-section.component.html", styleUrl: "./activity-light-section.component.scss",
})
export class ActivityLightSectionComponent implements OnInit, OnDestroy {
  class = "disabled";
  disabled = true;
  activity_light_color = "N/A";
  private destroyed = false;
  async ngOnInit() {
    try {
      const board = (await invoke<string>("boardname")).trim().toLowerCase();
      if (!this.destroyed && ["candy", "kefka"].includes(board)) {
        this.disabled = false; this.class = "";
      }
    } catch (error) { console.error("activity light detection:", error); }
  }
  async update_color(event: Event) {
    const color = (event.target as HTMLSelectElement).value;
    if (this.disabled || color === "Select A Color") return;
    try {
      await invoke("change_activity_light", { selected: color === "Off" ? "Black" : color });
      if (!this.destroyed) this.activity_light_color = color;
    } catch (error) { console.error("activity light:", error); }
  }
  ngOnDestroy() { this.destroyed = true; }
}
