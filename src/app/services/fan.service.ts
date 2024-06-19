import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FanService {

  selected_mode = 'custom';
  modeChange: Subject<string> = new Subject<string>;

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
