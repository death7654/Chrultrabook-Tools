import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { FanService } from '../../services/fan.service';
import { profile } from '../../services/profiles';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-fan-profiles',
  standalone: true,
  imports: [ButtonComponent, NgFor],
  templateUrl: './fan-profiles.component.html',
  styleUrl: './fan-profiles.component.scss'
})
export class FanProfilesComponent{
  profiles: profile[] = []
  fan_service: FanService = inject(FanService)

  constructor(){
    this.profiles = this.fan_service.getProfiles()
  }


  addProfiles()
  {
    let name = (document.getElementById('text') as HTMLInputElement).value
    this.fan_service.addProfile(name)
    let item = localStorage.getItem('profiles')
    console.log(JSON.parse(item!))
    console.log(this.fan_service.getProfiles())
  }

}
