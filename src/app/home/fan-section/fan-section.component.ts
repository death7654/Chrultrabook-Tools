import { Component, inject, OnInit } from "@angular/core";
import { FanService } from "../../services/fan.service";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";

@Component({
    selector: "app-fan-section",
    imports: [],
    templateUrl: "./fan-section.component.html",
    styleUrl: "./fan-section.component.scss",
    providers: [FanService]
})
export class FanSectionComponent implements OnInit {
  selected_mode: string = "N/A";
  temp: number = 0;
  fan_exists: boolean = true;
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

  zoom: number = 1;

  fanService: FanService = inject(FanService);

  constructor() {}

  ngOnInit() {
    invoke("execute", {
      program: "ectool",
      arguments: ["pwmgetfanrpm", "all"],
      reply: true,
    }).then((event) => {
      let output: any = event;
      let split = output.split(" ");
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
        invoke("local_storage", {
          function: "get",
          option: "fan_boot",
          value: "",
        }).then((event: any) => {
          let output = JSON.parse(event);
          if (output == true) {
            const selected_data = this.fanService.getSelected();
            this.selected_mode = selected_data[0];
            this.fan_array = selected_data[1];
            this.custom_active = "active";
            this.apply_interval();
          } else {
            this.auto_active = "active";
            this.selected_mode = "Auto";
            this.fan_auto();
          }
        });

        setInterval(this.get_fan_rpm, 1000);
        this.button = "border-0";
      }
      invoke("local_storage", {
        function: "get",
        option: "zoom",
        value: "",
      }).then((percentage) => {
        if (typeof percentage === "string") {
          const number = Number(percentage) / 100;
          this.zoom = number;
        }
      });

    });

    //starts the interval of reading the cpu temps
    setInterval(() => {
      this.get_cpu_temp();
    }, 1000);

    //listens to the data outputted by rust
    const appWebview = getCurrentWebviewWindow();
    appWebview.listen<string>("fan_curve", (event) => {
      let payload = event.payload;
      let payload_split = payload.split(" ");
      let profile = payload_split[0];
      (document.getElementById("selected_mode") as HTMLInputElement).innerText =
        profile;
      this.fan_array = JSON.parse(payload_split[1]);
      console.log(this.fan_array);
      this.fan_custom();
    });



  }

  async get_cpu_temp() {
    const output: number = await invoke("get_temps");
    const convertedOutput = output.toString().trim();
    (document.getElementById("temp") as HTMLInputElement).innerText =
      convertedOutput;
    this.temp = Number(convertedOutput);
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

  switchSelected() {
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
    this.auto_active = "active";
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
    this.off_active = "active";
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
    this.switchSelected();
    this.custom_active = "active";
    this.apply_interval();
  }
  apply_interval() {
    clearInterval(this.interval);
    this.interval = setInterval(async () => {
      invoke("set_custom_fan", { temp: this.temp, array: this.fan_array });
    }, 1000);
  }

  open_fan_custom_window() {
    invoke("open_window", { name: "Custom_Fans", width: 980.0, height: 540.0, zoom: this.zoom });
  }

  ngOnDestroy()
  {
    clearInterval(this.interval);
  }
}
