import { Component, inject } from "@angular/core";
import { FanService } from "../../services/fan.service";
import { invoke } from "@tauri-apps/api/core";
import { Subject, takeUntil } from "rxjs";
import { profile } from "../../services/profiles";

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
  temp: number = 9;
  fan_exists: boolean = true;
  fan_on_boot: boolean = false;
  disabled_class: string = "disable";
  button: string = "btn-outline-secondary";
  fan_auto_class: string = "";
  fan_off_class: string = "";
  fan_max_class: string = "";
  fan_custom_class: string = "";
  extension: string = "N/A";
  profiles: profile[] = [];
  interval: any;
  fan_array: any;

  fanService: FanService = inject(FanService);

  constructor() {}

  async ngOnInit() {
    setTimeout(() => {
      this.profiles = this.fanService.getProfiles();
    }, 1000);

    let output_fan: string = await invoke("local_storage", {
      function: "get",
      option: "fan_boot",
      value: "",
    });
    this.fan_on_boot = JSON.parse(output_fan);
    let output: string = await invoke("execute", {
      program: "ectool",
      arguments: ["pwmgetfanrpm", "all"],
      reply: true,
    });
    let split = output.split(" ");

    if (split[0] == "Fan") {
      //fans are auto disabled, this reverses the disabling
      this.fan_auto_class = "btn-outline-success";
      this.fan_off_class = "btn-outline-warning ";
      this.fan_max_class = "btn-outline-danger";
      this.fan_custom_class = "btn-outline-info btn-outline-info-custom";
      this.disabled_class = "";
      this.fan_exists = false;

      //checks if user wants fan curves on boot and applies the respective classes
      if (this.fan_on_boot == true) {
        this.fan_custom_class =
          "btn-outline-info btn-outline-info-custom active";
        this.fanService.getIndex.subscribe((index) => {
          setTimeout(() => {
            console.log(this.profiles);
            this.selected_mode = this.profiles[Number(index)].name;
            this.fan_array = this.profiles[Number(index)].array;
            this.apply_interval();
          }, 1500);
        });
      } else {
        this.fan_auto_class = "btn-outline-success active";
        this.selected_mode = "Auto";
        this.fan_auto();
      }

      this.extension = "RPM";
      setInterval(this.get_fan_rpm, 1000);
      this.button = "btn-border-none";
    }
    setInterval(() => {
      this.get_cpu_temp()
      console.log(this.temp);
    }, 1000);
  }

  async get_cpu_temp() {
    let output: number = await invoke("get_temps");
    let convertedOutput = output.toString().trim();
    (document.getElementById("temp") as HTMLInputElement).innerText = convertedOutput
    this.temp = Number(convertedOutput)
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
    clearInterval(this.interval);
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
    clearInterval(this.interval);
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
    clearInterval(this.interval);
    this.selected_mode = "Max";
    this.fan_auto_class = "btn-outline-success";
    this.fan_off_class = "btn-outline-warning";
    this.fan_max_class = "btn-outline-danger active";
    this.fan_custom_class = "btn-outline-info btn-outline-info-custom";
  }

  fan_custom() {
    this.fan_auto_class = "btn-outline-success";
    this.fan_off_class = "btn-outline-warning";
    this.fan_max_class = "btn-outline-danger";
    this.fan_custom_class = "btn-outline-info btn-outline-info-custom active";
    this.apply_interval();
  }
  apply_interval()
  {
    clearInterval(this.interval);
    this.interval = setInterval(async () => {
      console.log(this.temp)
      invoke("set_custom_fan", {temp: this.temp, array: this.fan_array })
    }, 1000)
  }

  open_fan_custom_window() {
    invoke("open_custom_fan");
  }
}
