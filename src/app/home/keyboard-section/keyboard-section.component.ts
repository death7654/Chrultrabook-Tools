import { Component, OnInit } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-keyboard-section",
  standalone: true,
  imports: [],
  templateUrl: "./keyboard-section.component.html",
  styleUrl: "./keyboard-section.component.scss",
})
export class KeyboardSectionComponent implements OnInit {
  backlight_percentage: string = "N/A";
  percentage: number = 0;
  backlight_exists: boolean = !true;
  disabled_class: string = "";
  extension: string = "";

  async ngOnInit() {
    setTimeout(async () => {
      const output: string = await invoke("execute", {
        program: "ectool",
        arguments: ["pwmgetkblight"],
        reply: true,
      });
      const split = output.split(" ");
      if (split[0] !== "Current") {
        this.disabled_class = "disabled";
        this.backlight_exists = !false;
      } else {
        this.backlight_percentage = split[4].trim();
        this.percentage = Number(split[4]);
        this.extension = "%";
      }
    }, 0);
  }

  update_percentage(event: MouseEvent) {
    this.backlight_percentage = (event.target as HTMLInputElement).value;
    invoke("execute", {
      program: "ectool",
      arguments: ["pwmsetkblight", this.backlight_percentage],
      reply: false,
    });
  }

  keyboard_more() {
    console.log("more");
    invoke("open_keyboard_extra");
  }
}
