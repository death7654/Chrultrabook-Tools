import { Component, OnInit } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-activity-light-section",
  standalone: true,
  imports: [],
  templateUrl: "./activity-light-section.component.html",
  styleUrl: "./activity-light-section.component.scss",
})
export class ActivityLightSectionComponent implements OnInit {
  class: string = "disabled";
  disabled: boolean = true;

  ngOnInit() {
    invoke("boardname").then((event:any) => {
      let output = event.trim().toLowerCase()
      if (output == "candy" || output == "kefka" || output == "vayne") {
        this.disabled = false;
        this.class = " ";
      }
    });
  }

  activity_light_color: string = "N/A";
  update_color(event: MouseEvent) {
    const selected_color = (event.target as HTMLInputElement).value;
    if (selected_color === "Select A Color") {
      this.activity_light_color = "Off";
      invoke("change_activity_light", { selected: "Black" });
    } else {
      this.activity_light_color = selected_color;
      invoke("change_activity_light", { selected: this.activity_light_color });
    }
  }
}
