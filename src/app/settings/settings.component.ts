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
  ngOnInit()
  {
    let version_imported = version
    this.version_applied = version_imported
    console.log(version_imported)
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
    if (this.items[i].answer) {
      this.items[i].answer = false
    } else {
      this.items[i].answer = true
    }
    console.log(this.items[i].function + this.items[i].answer)
    invoke("test")
  }
}
