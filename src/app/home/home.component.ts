import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { FanSectionComponent } from "./fan-section/fan-section.component";
import { KeyboardSectionComponent } from "./keyboard-section/keyboard-section.component";
import { ActivityLightSectionComponent } from "./activity-light-section/activity-light-section.component";
import { ExtraSectionComponent } from "./extra-section/extra-section.component";
import { invoke } from "@tauri-apps/api/core";
import { ec, zoomScale } from "../services/device";

@Component({
  selector: "app-home",
  imports: [FanSectionComponent, KeyboardSectionComponent, ActivityLightSectionComponent, ExtraSectionComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly class = signal("displaynone");
  private destroyed = false;
  async ngOnInit() {
    try {
      const hello = await ec(["hello"]);
      if (!this.destroyed) this.class.set(hello.trim().toLowerCase() === "ec says hello!" ? "displaynone" : "");
    } catch (error) {
      console.error("EC detection:", error);
      if (!this.destroyed) this.class.set("");
    }
    try {
      const value = await invoke<string>("local_storage", { function: "get", option: "zoom", value: "" });
      if (!this.destroyed) await invoke("setzoom", { scale: zoomScale(value) });
    } catch (error) { console.error("window zoom:", error); }
  }
  ngOnDestroy() { this.destroyed = true; }
}
