import { Component } from "@angular/core";
import { FanSectionComponent } from "./fan-section/fan-section.component";
import { KeyboardSectionComponent } from "./keyboard-section/keyboard-section.component";
import { ActivityLightSectionComponent } from "./activity-light-section/activity-light-section.component";
import { ExtraSectionComponent } from "./extra-section/extra-section.component";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    FanSectionComponent,
    KeyboardSectionComponent,
    ActivityLightSectionComponent,
    ExtraSectionComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {

  class: string = " "

  ngOnInit()
  {
    setTimeout(() => {
      invoke("execute", {
        program: "ectool",
        arguments: ["hello"],
        reply: true,
      }).then((event: any) =>
      {
        let output = event.toLowerCase().trim();
        if (output == "ec says hello!")
        {
          this.class = "displaynone"
        }
      });
    })
  }

}
