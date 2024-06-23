import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { profile } from "./profiles";
import { invoke } from "@tauri-apps/api/core";

@Injectable({
  providedIn: "root",
})
export class FanService {
  selected_mode = "custom";
  modeChange: Subject<string> = new Subject<string>();

  public profiles_list: profile[] = this.boot();

  boot(): profile[] {
    invoke("get_json").then((res) => {
      this.profiles_list = JSON.parse(res as string);
    });
    return this.profiles_list;
  }

  getProfiles(): profile[] {
    return this.profiles_list;
  }

  getProfileArrayByName(name: string) {
    return this.profiles_list.find((profile) => profile.name === name);
  }

  addProfile(name: string) {
    let id = 0;
    for (let key in this.profiles_list) {
      this.profiles_list[key].id == id++;
    }
    let newProfile = {
      id: id,
      name: name,
      array: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100, 100],
      selected: false,
      disabled: true
    };
    this.profiles_list.push(newProfile);
    let jsonString = JSON.stringify(this.profiles_list);
    invoke("local_storage", {
      function: "save",
      option: "profiles",
      value: jsonString,
    });
  }

  deleteProfile(i: number)
  {
    this.profiles_list.splice(i, 1);
    let jsonString = JSON.stringify(this.profiles_list);
    invoke("local_storage", {
      function: "save",
      option: "profiles",
      value: jsonString,
    });
  }

  changeMode(mode: string) {
    console.log(mode);
    this.selected_mode = mode;
    this.modeChange.next(mode);
  }
  getMode() {
    return this.selected_mode;
  }
}
