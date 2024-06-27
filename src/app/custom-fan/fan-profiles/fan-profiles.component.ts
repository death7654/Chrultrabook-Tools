import { Component, HostListener, inject } from "@angular/core";
import { FanService } from "../../services/fan.service";
import { profile } from "../../services/profiles";
import { NgFor } from "@angular/common";

@Component({
  selector: "app-fan-profiles",
  standalone: true,
  imports: [NgFor],
  templateUrl: "./fan-profiles.component.html",
  styleUrl: "./fan-profiles.component.scss",
})
export class FanProfilesComponent {
  edit: boolean = false;
  img_class: string = "btn-outline-info";
  img: string = "\uF4CB";

  profiles: profile[] = [];
  fan_service: FanService = inject(FanService);

  //TODO, transfer data from this component to fan section component in the home component using the fan service
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
    let name = (document.getElementById("text") as HTMLInputElement).value;
    if (name !== "") {
      (document.getElementById("text") as HTMLInputElement).value = "";
      this.fan_service.addProfile(name);
    }
  }

  changeGlobalID(i: number) {
    this.editProfile(i);
  }

  editProfile(i: number) {
    console.log(i);
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
      let changed_name = (
        document.getElementById(
          this.profiles[i].id.toString()
        ) as HTMLInputElement
      ).value;
      if (changed_name !== "") {
        this.profiles[i].name = changed_name;
        this.fan_service.editProfileName(i, changed_name);
        (
          document.getElementById(
            this.profiles[i].id.toString()
          ) as HTMLInputElement
        ).value = "";
      }
    }
  }

  deleteProfiles(i: number) {
    this.fan_service.deleteProfile(i);
  }
}
