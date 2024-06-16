import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FanService {

  private fan_mode = new BehaviorSubject('N/A');
  mode_selected = this.fan_mode.asObservable();

  constructor() { }

  changeMode(mode: string)
  {
    console.log(this.mode_selected)
    this.fan_mode.next(mode);
  }
}
