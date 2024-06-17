import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { FanService } from '../../services/fan.service';
import { invoke } from "@tauri-apps/api/core"
import { Subject, takeUntil } from 'rxjs';

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
  disabled_class: string = ''
  fan_auto_class: string = '';
  fan_off_class: string = '';
  fan_max_class: string = '';
  fan_custom_class: string = '';
  extension: string = ''

  destroy = new Subject();


  private fanService = inject(FanService)

  async ngOnInit() {
    this.fanService.mode_selected.pipe(takeUntil(this.destroy)).subscribe((res: string) =>{
      console.log(res);
    })

    setTimeout(async () => {
      setInterval(this.get_cpu_temp, 2000);
    }, 0);
    let output: String = await invoke("execute", { program: "ectool", arguments: ['pwmgetfanrpm', "all"], reply: true })
    let split = output.split(" ");
    if (split[0] !== "Fan") {
      this.fan_exists = false
      this.disabled_class = 'disabled'
      this.extension = 'N/A'
    }
    else {
      this.selected_mode = 'Auto'
      this.extension = 'RPM'
      setInterval(this.get_fan_rpm, 2000)
      this.fan_auto_class = 'fan_auto_selected';
      this.fan_off_class = ' ';
      this.fan_max_class = ' ';
      this.fan_custom_class = ' ';
    }
  }

  async get_cpu_temp() {
    let output: number = await invoke("get_temps");
    (document.getElementById('temp') as HTMLInputElement).innerText = output.toString().trim()
  }
  async get_fan_rpm() {
    let output: string = await invoke("execute", { program: "ectool", arguments: ['pwmgetfanrpm', "all"], reply: true });
    let split = output.split(" ");
    (document.getElementById('fanRPM') as HTMLInputElement).innerText = split[3].trim()
  }


  fan_auto() {
    invoke("execute", { program: "ectool", arguments: ['autofanctrl'], reply: false });
    this.selected_mode = 'Auto';
    this.fan_auto_class = 'fan_auto_selected';
    this.fan_off_class = ' ';
    this.fan_max_class = ' ';
    this.fan_custom_class = ' ';
  }
  fan_off() {
    invoke("execute", { program: "ectool", arguments: ['fanduty', '0'], reply: false });
    this.selected_mode = 'Off';
    this.fan_auto_class = ' ';
    this.fan_off_class = 'fan_off_selected';
    this.fan_max_class = ' ';
    this.fan_custom_class = ' ';
  }
  fan_max() {
    invoke("execute", { program: "ectool", arguments: ['fanduty', '100'], reply: false });
    this.selected_mode = 'Max';
    this.fan_auto_class = ' ';
    this.fan_off_class = ' ';
    this.fan_max_class = 'fan_max_selected';
    this.fan_custom_class = ' ';
  }

  fan_custom() {
    this.selected_mode = 'Custom';
    console.log(this.selected_mode);
    this.selected_mode = 'Off';
    this.fan_auto_class = ' ';
    this.fan_off_class = ' ';
    this.fan_max_class = ' ';
    this.fan_custom_class = 'fan_custom_selected';
  }
  open_fan_custom_window() {
    invoke('open_custom_fan');
  }
}
