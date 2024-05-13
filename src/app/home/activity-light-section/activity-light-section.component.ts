import { Component } from "@angular/core";

@Component({
  selector: "app-activity-light-section",
  standalone: true,
  imports: [],
  templateUrl: "./activity-light-section.component.html",
  styleUrl: "./activity-light-section.component.scss",
})
export class ActivityLightSectionComponent {
  activity_light_color: string = "Off";
  update_color(event: MouseEvent) {
    let selected_color = (event.target as HTMLInputElement).value;
    if (selected_color === "Select A Color") {
      this.activity_light_color = "Off";
    } else {
      this.activity_light_color = selected_color;
    }
  }
}
