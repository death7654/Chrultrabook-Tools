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
  ngOnInit() {
    this.version_applied = version;

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
}
