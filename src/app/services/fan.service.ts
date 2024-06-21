import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { profile } from './profiles';
import { invoke } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FanService{

  selected_mode = 'custom';
  modeChange: Subject<string> = new Subject<string>;


  public profiles_list: profile[] = this.boot()

  boot(): profile[]
  {
    let store = localStorage.getItem("profiles")
    if (store === null)
      {
        return [
          {
            id: 0,
            name: 'Default',
            array: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100, 100],
            selected: true
          },
          {
            id: 1,
            name: 'Aggressive',
            array: [0, 10, 40, 50, 60, 90, 100, 100, 100, 100, 100, 100, 100],
            selected: false
          },
          {
            id: 2,
            name: 'Quiet',
            array: [0, 15, 20, 30, 40, 55, 90, 100, 100, 100, 100, 100, 100],
            selected: false
          }
        ]
      }
      else 
      {
        return JSON.parse(store);
      }
  }

  getProfiles(): profile[]
  {
    return this.profiles_list
  }

  getProfileArrayByName(name: string)
  {
    return this.profiles_list.find(profile => profile.name === name)
  }
  addProfile(name: string)
  {
    let id = 0;
    for (let key in this.profiles_list)
      {
        this.profiles_list[key].id == id++
      }
    let newProfile = {
      id: id,
      name: name,
      array: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100, 100],
      selected: false
    }
    this.profiles_list.push(newProfile);
    localStorage.setItem("profiles", JSON.stringify(this.profiles_list))
  }

  changeMode(mode: string)
  {
    console.log(mode)
    this.selected_mode = mode
    this.modeChange.next(mode)
  }
  getMode() {
    return this.selected_mode;
  }

}
