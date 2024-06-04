import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { invoke } from "@tauri-apps/api/core"


@Component({
  selector: 'app-keyboard-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './keyboard-section.component.html',
  styleUrl: './keyboard-section.component.scss'
})
export class KeyboardSectionComponent {
  backlight_percentage: string = 'N/A'
  percentage: number = 0
  backlight_exists: boolean = !true;
  disabled_class: string = ''
  async ngOnInit() {
    console.log('hello')
    let output: string = await invoke("execute", { program: "ectool", arguments: ['pwmgetkblight'], reply: true });
    let split = output.split(" ");
    if (split[0] !== "Current")
      {
        this.disabled_class = 'disabled'
        this.backlight_exists = !false
      }
      else
      {
        this.backlight_percentage = split[4]
        this.percentage = Number(split[4])
      }
  }

  update_percentage(event: MouseEvent)
  {
    this.backlight_percentage = (event.target as HTMLInputElement).value + "%"
  }


  keyboard_more(){
    console.log('more');
    invoke('open_keyboard_extra');
  }
}
