import { Component, inject, OnInit } from "@angular/core";
import { FanService } from "../../services/fan.service";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-fan-section",
  standalone: true,
  imports: [],
  templateUrl: "./fan-section.component.html",
  styleUrl: "./fan-section.component.scss",
  providers: [FanService],
})
export class FanSectionComponent implements OnInit {
  selected_mode: string = "N/A";
  temp: number = 0;
  fan_exists: boolean = true;
  fan_on_boot: boolean = false;
  disabled_class: string = "disable";
  button: string = "btn-outline-secondary";

  fan_auto_class: string = "";
  fan_off_class: string = "";
  fan_max_class: string = "";
  fan_custom_class: string = "";

  auto_active: string = "";
  off_active: string = "";
  max_active: string = "";
  custom_active: string = "";

  active_class: string = "";
  extension: string = "N/A";
  interval: any;
  fan_array: any;

  fanService: FanService = inject(FanService);

  constructor() {}

  async ngOnInit() {

    const output_fan: string = await invoke("local_storage", {
      function: "get",
      option: "fan_boot",
      value: "",
    });
    this.fan_on_boot = JSON.parse(output_fan);
    const output: string = await invoke("execute", {
      program: "ectool",
      arguments: ["pwmgetfanrpm", "all"],
      reply: true,
    });
    const split = output.split(" ");

    if (split[0] == "Fan") {
      //fans are auto disabled, this reverses the disabling
      this.fan_auto_class = "btn-outline-success";
      this.fan_off_class = "btn-outline-warning ";
      this.fan_max_class = "btn-outline-danger";
      this.fan_custom_class = "btn-outline-info btn-outline-info-custom";
      this.extension = "RPM";
      this.disabled_class = "";
      this.fan_exists = false;

      //checks if user wants fan curves on boot and applies the respective classes
      if (this.fan_on_boot == true) {
        const selected_data = this.fanService.getSelected()
        this.selected_mode = selected_data[0];
        this.fan_array = selected_data[1];
        this.custom_active = "active";
        this.apply_interval();
      } else {
        this.auto_active = "active"
        this.selected_mode = "Auto";
        this.fan_auto();
      }

      setInterval(this.get_fan_rpm, 1000);
      this.button = "btn-border-none";
    }

    setInterval(() => {
      this.get_cpu_temp();
    }, 1000);
  }

  async get_cpu_temp() {
    const output: number = await invoke("get_temps");
    const convertedOutput = output.toString().trim();
    (document.getElementById("temp") as HTMLInputElement).innerText = convertedOutput
    this.temp = Number(convertedOutput)
  }
  async get_fan_rpm() {
    const output: string = await invoke("execute", {
      program: "ectool",
      arguments: ["pwmgetfanrpm", "all"],
      reply: true,
    });
    const split = output.split(" ");
    (document.getElementById("fanRPM") as HTMLInputElement).innerText =
      split[3].trim();
  }

  switchSelected()
  {
    this.auto_active = "";
    this.off_active = "";
    this.max_active = "";
    this.custom_active = "";
  }

  fan_auto() {
    invoke("execute", {
      program: "ectool",
      arguments: ["autofanctrl"],
      reply: false,
    });
    clearInterval(this.interval);
    this.selected_mode = "Auto";
    this.switchSelected();
    this.auto_active = "active"
  }
  fan_off() {
    invoke("execute", {
      program: "ectool",
      arguments: ["fanduty", "0"],
      reply: false,
    });
    clearInterval(this.interval);
    this.selected_mode = "Off";
    this.switchSelected();
    this.off_active = "active"
  }
  fan_max() {
    invoke("execute", {
      program: "ectool",
      arguments: ["fanduty", "100"],
      reply: false,
    });
    clearInterval(this.interval);
    this.selected_mode = "Max";
    this.switchSelected();
    this.max_active = "active";
  }

  fan_custom() {
    this.switchSelected()
    this.custom_active = "active"
    this.apply_interval();
  }
  apply_interval()
  {
    clearInterval(this.interval);
    this.interval = setInterval(async () => {
      invoke("set_custom_fan", {temp: this.temp, array: this.fan_array })
    }, 1000)
  }

  open_fan_custom_window() {
    invoke("open_custom_fan");
  }
}
