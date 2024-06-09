import { Component } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-activity-light-section",
  standalone: true,
  imports: [],
  templateUrl: "./activity-light-section.component.html",
  styleUrl: "./activity-light-section.component.scss",
})
export class ActivityLightSectionComponent {
  class: string = 'disabled'
  disabled: boolean = true;

  async ngOnInit()
  {
    let boardname: string = await invoke("boardname")
    let split = boardname.trim().split("\n")
    if (split[2] == "Candy" || split[2] == "Kefka")
      {
        this.disabled = false
        this.class = ' '
      }
  }



  activity_light_color: string = "N/A";
  update_color(event: MouseEvent) {
    let selected_color = (event.target as HTMLInputElement).value;
    if (selected_color === "Select A Color") {
      this.activity_light_color = "Off";
      invoke("change_activity_light", {selected: "black"});
    } else {
      this.activity_light_color = selected_color;
      invoke("change_activity_light", {selected: this.activity_light_color});
    }
  }
}
