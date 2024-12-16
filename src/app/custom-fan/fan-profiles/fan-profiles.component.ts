import { Component, HostListener, inject } from "@angular/core";
import { FanService } from "../../services/fan.service";
import { profile } from "../../services/profiles";

@Component({
    selector: "app-fan-profiles",
    imports: [],
    templateUrl: "./fan-profiles.component.html",
    styleUrl: "./fan-profiles.component.scss"
})
export class FanProfilesComponent {
  edit: boolean = false;
  img_class: string = "btn-outline-info";
  img: string = "\uF4CB";

  profiles: profile[] = [];
  fan_service: FanService = inject(FanService);

  constructor() {
    setTimeout(() => {
      this.profiles = this.fan_service.getProfiles();
    }, 550);
  }

  @HostListener("window:keydown", ["$event"])
  enter(event: KeyboardEvent) {
    if (event.code == "Enter") {
      this.addProfiles();
    }
  }

  addProfiles() {
    const name = (
      document.getElementById("text") as HTMLInputElement
    ).value.trim();
    if (name !== "") {
      (document.getElementById("text") as HTMLInputElement).value = "";
      this.fan_service.addProfile(name);
    }
  }

  editProfile(i: number) {
    if (this.profiles[i].class === "transparent") {
      this.profiles[i].class = "edit";
      this.profiles[i].img = "\uF7D8";
      this.profiles[i].img_class = "btn-outline-success";
      this.profiles[i].disabled = false;
    } else {
      this.profiles[i].class = "transparent";
      this.profiles[i].img = "\uF4CB";
      this.profiles[i].img_class = "btn-outline-info";
      this.profiles[i].disabled = true;
      const changed_name = (
        document.getElementById(
          this.profiles[i].id.toString(),
        ) as HTMLInputElement
      ).value;
      if (changed_name !== "") {
        this.profiles[i].name = changed_name;
        this.fan_service.editProfileName(i, changed_name);
      }
    }
  }

  deleteProfiles(i: number) {
    this.fan_service.deleteProfile(i);
  }
}
