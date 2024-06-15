import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FanService {

  private fan_source = new BehaviorSubject('Auto');
  mode_selected = this.fan_source.asObservable();

  constructor() { }

  changeMode(mode: string)
  {
    this.fan_source.next(mode);
  }
}
