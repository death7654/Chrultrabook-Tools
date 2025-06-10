import { Component, OnInit } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { version } from "../../../package.json";

@Component({
  selector: "app-settings",
  imports: [],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss"
})
export class SettingsComponent implements OnInit {
  version_applied: string = "";
  linux: boolean = true;

  sensors: any;

  ngOnInit() {
    this.version_applied = version;
    invoke("local_storage").then((os) => {
      if (typeof os == "string") {
        if (os != "linux") {
          this.linux = false;
        }
      }
    })

    invoke("local_storage", {
      function: "get",
      option: "fan_boot",
      value: "",
    }).then((fan_boot) => {
      if (fan_boot == "true") {
        this.options[0].answer = true;
      }
    });

    invoke("local_storage", {
      function: "get",
      option: "app_tray",
      value: "",
    }).then((app_tray) => {
      if (app_tray == "true") {
        this.options[1].answer = true;
      }
    });

    invoke("local_storage", {
      function: "get",
      option: "start_app_tray",
      value: "",
    }).then((start_app_tray) => {
      if (start_app_tray == "true") {
        this.options[2].answer = true;
      }
    });

    invoke("local_storage", {
      function: "get",
      option: "app_boot",
      value: "",
    }).then((app_boot) => {
      if (app_boot == "true") {
        this.options[3].answer = true;
      }
    });

    invoke("get_sensors").then((sensor_data) => {
      if (typeof sensor_data === "string") {
        this.sensors = sensor_data.split("\n");
      }
      let sensors_html = "<div class=\"form-check\">";
      let sensor;
      for (let i = 0; i < this.sensors.length - 1; i++) {
        sensor = "<label class=\"form-check-label fs-4\" for=\"" + this.sensors[i] + "\">" + this.sensors[i] + "</label><input class=\"form-check-input\" type=\"checkbox\" id=\"" + this.sensors[i] + "\" value=\"\" checked><br>"
        sensors_html = sensors_html.concat(sensor);

      }
      sensors_html = sensors_html.concat("</div>");

      (document.getElementById("sensor_area") as HTMLElement).innerHTML = sensors_html;

      for (let i = 0; i < this.sensors.length - 1; i++) {
        (document.getElementById(this.sensors[i]) as HTMLInputElement).addEventListener("click", () => {
          this.change_sensor()
        }
        );
      }
    })

    invoke("local_storage", {
      function: "get",
      option: "sensor_selection",
      value: "",
    }).then((value) => {
      let states;
      if (typeof value === "string" && value == "") {
        states = value.split(" ");
      }
      else {
        states = ["true", "true", "true"];
      }

      for (let i = 0; i < this.sensors.length - 1; i++) {
        (document.getElementById(this.sensors[i]) as HTMLInputElement).checked = /^true$/i.test(states[i]);
      }
    });
    invoke("local_storage", {
      function: "get",
      option: "zoom",
      value: "",
    }).then((percentage) => {
      if (typeof percentage === "string") {
        if (percentage == "") {
          (document.getElementById("zoom") as HTMLInputElement).value = "100";
        }
        else {
          (document.getElementById("zoom") as HTMLInputElement).value = percentage;
        }
      }
    });
  }

  options = [
    {
      id: 1,
      function: "Start Custom Fan Curves On App Startup",
      answer: false,
    },
    {
      id: 2,
      function: "Main Window Minimizes To Tray On Exit",
      answer: false,
    },
    {
      id: 3,
      function: "Start App in System Tray",
      answer: false,
    },
    {
      id: 4,
      function: "Start App On Boot",
      answer: false,
    },
  ];
  toggle(i: number) {
    if (this.options[i].answer) {
      this.options[i].answer = false;
    } else {
      this.options[i].answer = true;
    }
    switch (i) {
      case 0:
        invoke("local_storage", {
          function: "save",
          option: "fan_boot",
          value: this.options[0].answer.toString(),
        });
        break;
      case 1:
        invoke("local_storage", {
          function: "save",
          option: "app_tray",
          value: this.options[1].answer.toString(),
        });
        break;
      case 2:
        invoke("local_storage", {
          function: "save",
          option: "start_app_tray",
          value: this.options[2].answer.toString(),
        });
        break;
      case 3:
        invoke("local_storage", {
          function: "save",
          option: "app_boot",
          value: this.options[3].answer.toString(),
        });
        invoke("autostart", { value: this.options[3].answer });
        break;
    }
  }
  update_zoom(value: string) {
    const number = Number(value) / 100;
    invoke("setzoom", { scale: number });
    invoke("local_storage", {
      function: "save",
      option: "zoom",
      value: value,
    });
  }

  change_sensor() {
    let sensor_state = ""
    for (let i = 0; i < this.sensors.length - 1; i++) {
      let checked = (document.getElementById(this.sensors[i]) as HTMLInputElement).checked;
      sensor_state = sensor_state.concat(checked + " ")
    }

    invoke("local_storage", {
      function: "save",
      option: "sensor_selection",
      value: sensor_state,
    });

  }

  async confirmResetDialog(): Promise<boolean> {
    return confirm("Are you sure you want to reset the app? This will delete all app data and close the app.");
  }
  confirmReset() {
    let confirmed = this.confirmResetDialog().then((confirm) => {
      if (confirm) {
        // Trigger your reset logic here
        // window.__TAURI__.invoke('reset_app');
        invoke("reset")
      }

    });
  }
}
