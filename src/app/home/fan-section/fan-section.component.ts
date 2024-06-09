import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { invoke } from "@tauri-apps/api/core"

@Component({
  selector: 'app-fan-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './fan-section.component.html',
  styleUrl: './fan-section.component.scss',
})
export class FanSectionComponent {
  selected_mode: string = 'N/A'
  temp: string = '0'
  fan_exists: boolean = !true;
  fan_class: string = '';
  extension: string = ''

  async ngOnInit() {
    setTimeout(async () => {
      setInterval(this.get_cpu_temp, 2000);
    }, 0);
    let output: String = await invoke("execute", { program: "ectool", arguments: ['pwmgetfanrpm', "all"], reply: true })
    let split = output.split(" ");
    if (split[0] !== "Fan") {
      this.fan_exists = false
      this.fan_class = 'disabled'
      this.extension = 'N/A'
    }
    else
    {
      this.selected_mode = 'Auto'
      this.extension = 'RPM'
      setInterval(this.get_fan_rpm, 2000)
    }
  }

  async get_cpu_temp()
  {
    let output: number = await invoke("get_temps");
    (document.getElementById('temp') as HTMLInputElement).innerText = output.toString().trim()
  }
  async get_fan_rpm()
  {
    let output: string = await invoke("execute", { program: "ectool", arguments: ['pwmgetfanrpm',"all"], reply: true });
    let split = output.split(" ");
    (document.getElementById('fanRPM') as HTMLInputElement).innerText = split[3].trim()
  }

  fan_auto() {
    invoke("execute", { program: "ectool", arguments: ['autofanctrl'], reply: false });
    this.selected_mode = 'Auto';
  }
  fan_off() {
    invoke("execute", { program: "ectool", arguments: ['fanduty', '0'], reply: false });
    this.selected_mode = 'Off';
  }
  fan_max() {
    invoke("execute", { program: "ectool", arguments: ['fanduty', '100'], reply: false });
    this.selected_mode = 'Max';
  }
  fan_custom()
  {
    this.selected_mode = 'Custom';
    console.log('hello')
  }
  open_fan_custom_window() {
    invoke('open_custom_fan');
  }
}
