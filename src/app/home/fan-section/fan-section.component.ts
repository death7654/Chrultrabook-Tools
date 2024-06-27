import { Component, inject } from "@angular/core";
import { FanService } from "../../services/fan.service";
import { invoke } from "@tauri-apps/api/core";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-fan-section",
  standalone: true,
  imports: [],
  templateUrl: "./fan-section.component.html",
  styleUrl: "./fan-section.component.scss",
  providers: [FanService],
})
export class FanSectionComponent {
  selected_mode: string = "N/A";
  temp: string = "0";
  fan_exists: boolean = false;
  disabled_class: string = "";
  button: string = "";
  fan_auto_class: string = "";
  fan_off_class: string = "";
  fan_max_class: string = "";
  fan_custom_class: string = "";
  extension: string = "";

  fanService: FanService = inject(FanService);

  constructor() {}

  get mode(): string {
    return this.fanService.selected_mode;
  }

  test() {
    console.log(this.selected_mode);
  }

  async ngOnInit() {
    this.fanService.modeChange.subscribe((value) => {
      let mode = this.fanService.getMode();
      this.selected_mode = mode;
      console.log(value);
    });

    setTimeout(async () => {
      setInterval(this.get_cpu_temp, 1000);
    }, 0);
    let output: String = await invoke("execute", {
      program: "ectool",
      arguments: ["pwmgetfanrpm", "all"],
      reply: true,
    });
    let split = output.split(" ");
    if (split[0] !== "Fan") {
      this.fan_exists = true;
      this.disabled_class = "disable";
      this.extension = "N/A";
      this.button = "btn-outline-secondary";
    } else {
      this.selected_mode = "Auto";
      this.extension = "RPM";
      setInterval(this.get_fan_rpm, 1000);
      this.button = "btn-border-none";
      this.fan_auto_class = "btn-outline-success active";
      this.fan_off_class = "btn-outline-warning ";
      this.fan_max_class = "btn-outline-danger";
      this.fan_custom_class = "btn-outline-info btn-outline-info-custom";
    }
  }

  async get_cpu_temp() {
    let output: number = await invoke("get_temps");
    (document.getElementById("temp") as HTMLInputElement).innerText = output
      .toString()
      .trim();
  }
  async get_fan_rpm() {
    let output: string = await invoke("execute", {
      program: "ectool",
      arguments: ["pwmgetfanrpm", "all"],
      reply: true,
    });
    let split = output.split(" ");
    (document.getElementById("fanRPM") as HTMLInputElement).innerText =
      split[3].trim();
  }

  fan_auto() {
    invoke("execute", {
      program: "ectool",
      arguments: ["autofanctrl"],
      reply: false,
    });
    this.selected_mode = "Auto";
    this.fan_auto_class = "btn-outline-success active";
    this.fan_off_class = "btn-outline-warning";
    this.fan_max_class = "btn-outline-danger";
    this.fan_custom_class = "btn-outline-info btn-outline-info-custom";
  }
  fan_off() {
    invoke("execute", {
      program: "ectool",
      arguments: ["fanduty", "0"],
      reply: false,
    });
    this.selected_mode = "Off";
    this.fan_auto_class = "btn-outline-success";
    this.fan_off_class = "btn-outline-warning active";
    this.fan_max_class = "btn-outline-danger";
    this.fan_custom_class = "btn-outline-info btn-outline-info-custom";
  }
  fan_max() {
    invoke("execute", {
      program: "ectool",
      arguments: ["fanduty", "100"],
      reply: false,
    });
    this.selected_mode = "Max";
    this.fan_auto_class = "btn-outline-success";
    this.fan_off_class = "btn-outline-warning";
    this.fan_max_class = "btn-outline-danger active";
    this.fan_custom_class = "btn-outline-info btn-outline-info-custom";
  }

  fan_custom() {
    this.selected_mode = "Custom";
    this.fan_auto_class = "btn-outline-success";
    this.fan_off_class = "btn-outline-warning";
    this.fan_max_class = "btn-outline-danger";
    this.fan_custom_class = "btn-outline-info btn-outline-info-custom";
  }
  open_fan_custom_window() {
    invoke("open_custom_fan");
  }
}
