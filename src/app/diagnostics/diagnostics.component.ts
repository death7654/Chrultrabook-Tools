import { Component, OnInit } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { FormsModule } from '@angular/forms';

@Component({
  selector: "app-diagnostics",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./diagnostics.component.html",
  styleUrl: "./diagnostics.component.scss",
})
export class DiagnosticsComponent implements OnInit {
  collected_info: string = "";
  selected_function: string | undefined;
  isMacOS: boolean = false;
  diagModes = new Map<string, string>([
    ["Battery Information", "Battery Information"],
    ["EC Console Log", "EC Console Log"],
    ["EC Chip Information", "EC Chip Information"],
    ["EC Protocol Information", "EC Protocol Information"],
    ["SPI Information", "SPI Information"],
    ["Temperature Sensor Information", "Temperature Sensor Information"],
    ["Power Delivery Information", "Power Delivery Information"],
  ]);
  diagModesExt = new Map<string, string>([
    ["Boot Timestraps", "Boot Timestraps"],
    ["Coreboot Log", "Coreboot Log"],
    ["Coreboot Extended Log", "Coreboot Extended Log"],
  ]);

  ngOnInit() {
    const os = invoke("os").then((os) => {
      if (os === "macOS") {
        this.isMacOS = true;
      }
    });
  }

  select() {
    if (this.selected_function) {
      invoke("diagnostics", {
        selected: this.selected_function,
      }).then(((info) => { this.collected_info = info as string }));
    }
  }

  copy_to_clipboard() {
    invoke("copy", { text: this.collected_info });
  }

  save() {
    invoke("save", {
      filename: this.selected_function,
      content: this.collected_info,
    });
  }
}
