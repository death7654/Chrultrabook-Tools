import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FanService {

  private fan_mode = new BehaviorSubject('N/A');
  mode_selected = this.fan_mode.asObservable();

  getMode()
  {
    return this.mode_selected
  }
  changeMode(mode: string)
  {
    console.log(this.mode_selected)
    this.fan_mode.next(mode);
  }
}
