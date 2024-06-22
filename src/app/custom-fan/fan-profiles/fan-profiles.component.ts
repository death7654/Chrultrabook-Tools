import { Component, inject } from "@angular/core";
import { ButtonComponent } from "../../button/button.component";
import { FanService } from "../../services/fan.service";
import { profile } from "../../services/profiles";
import { NgFor } from "@angular/common";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-fan-profiles",
  standalone: true,
  imports: [ButtonComponent, NgFor],
  templateUrl: "./fan-profiles.component.html",
  styleUrl: "./fan-profiles.component.scss",
})
export class FanProfilesComponent {
  profiles: profile[] = [];
  fan_service: FanService = inject(FanService);

  constructor() {
    setTimeout(() => {
      this.profiles = this.fan_service.getProfiles();
    }, 550);
  }

  async addProfiles() {
    invoke("get_json")
    let name = (document.getElementById("text") as HTMLInputElement).value;
    if (name !== "")
      {
        this.fan_service.addProfile(name);
      }
  }
}
