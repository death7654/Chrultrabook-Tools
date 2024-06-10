import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { NgFor } from '@angular/common';
import { invoke } from '@tauri-apps/api/core';
import { version } from '../../../package.json';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ButtonComponent, NgFor],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  version_applied: string = '';
  async ngOnInit()
  {
    let version_imported = version
    this.version_applied = version_imported

    let fan_boot = await invoke('local_storage', {function: "get", option:"fan_boot", value: ''});
    let app_tray = await invoke('local_storage', {function: "get", option:"app_tray", value: ''});
    let start_app_tray = await invoke('local_storage', {function: "get", option:"start_app_tray", value: ''});
    let app_boot = await invoke('local_storage', {function: "get", option: "app_boot", value: ''});

    if(fan_boot == "true")
      {
        this.items[0].answer = true;
      }
    if(app_tray == "true")
      {
        this.items[1].answer = true;
      }
    if(start_app_tray == "true")
      {
        this.items[2].answer = true
      }
    if(app_boot == "true")
      {
        this.items[3].answer = true
      }
  }

  items = [
    {
      id: 1,
      function: 'Start Custom Fan Curves On App Startup',
      answer: false
    },
    {
      id: 2,
      function: 'App Minimizes To Tray On Exit',
      answer: false
    },
    {
      id: 3,
      function: 'Start App in System Tray',
      answer: false
    },
    {
      id: 4,
      function: 'Start App On Boot',
      answer: false
    }
  ]
  toggle(i: number) {
    switch(i)
    {
      case 0:
        if (this.items[0].answer) {
          this.items[0].answer = false
          invoke("local_storage", {function: "save", option:"fan_boot",value: "false"});
        } else {
          this.items[0].answer = true
          invoke("local_storage", {function: "save", option:"fan_boot",value: "true"});
        }
        console.log('1')
        break;
      case 1:
        if (this.items[1].answer) {
          this.items[1].answer = false
          invoke("local_storage", {function: "save", option:"app_tray",value: "false"});
        } else {
          this.items[1].answer = true
          invoke("local_storage", {function: "save", option:"app_tray",value: "true"});
        }
        console.log('2')
        break;
      case 2:
        if (this.items[2].answer) {
          this.items[2].answer = false
          invoke("local_storage", {function: "save", option:"start_app_tray",value: "false"});
        } else {
          this.items[2].answer = true
          invoke("local_storage", {function: "save", option:"start_app_tray",value: "true"});
        }
        console.log('3')
        break;
      case 3:
        if (this.items[3].answer) {
          this.items[3].answer = false
          invoke("local_storage", {function: "save", option:"app_boot",value: "false"});
        } else {
          this.items[3].answer = true
          invoke("local_storage", {function: "save", option:"app_boot",value: "true"});
        }
        console.log('4')
        break;
    }
  }
}
