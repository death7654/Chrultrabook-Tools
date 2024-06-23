import { Component, inject } from "@angular/core";
import { ButtonComponent } from "../../button/button.component";
import { FanService } from "../../services/fan.service";
import { profile } from "../../services/profiles";
import { NgFor } from "@angular/common";

@Component({
  selector: "app-fan-profiles",
  standalone: true,
  imports: [ButtonComponent, NgFor],
  templateUrl: "./fan-profiles.component.html",
  styleUrl: "./fan-profiles.component.scss",
})
export class FanProfilesComponent {
  edit_class: string = 'transparent'
  img_class: string = 'btn-outline-info'
  img: string = "\uF4CB";
  global_id: number = 10000;

  profiles: profile[] = [];
  fan_service: FanService = inject(FanService);

  constructor() {
    setTimeout(() => {
      this.profiles = this.fan_service.getProfiles();
    }, 550);
  }

  addProfiles() {
    let name = (document.getElementById("text") as HTMLInputElement).value;
    if (name !== "")
      {
        this.fan_service.addProfile(name);
      }
  }

  changeGlobalID(i: number)
  {
    this.global_id = i;
    this.editProfile(i)
  }

  removeTransparent()
  {
    document.getElementById('profile_editor')!.classList.remove('transparent')
  }

  editProfile(i: number)
  {
    console.log(i)
    if (i === this.global_id && this.img === "\uF4CB")
      {
        this.edit_class = 'edit bg-secondary text-bg-dark'
        this.img_class = 'btn-outline-success'
        this.img = '\uF7D8'
        this.profiles[i].disabled = false
      }
      else if(this.global_id === i)
      {
        this.edit_class = 'transparent'
        this.img_class = 'btn-outline-info'
        this.img = '\uF4CB'
        this.profiles[i].disabled = true
      }
    
  }

  deleteProfiles(i: number)
  {
    this.fan_service.deleteProfile(i);
  }
}
