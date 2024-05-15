import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { invoke } from '@tauri-apps/api/tauri'


@Component({
  selector: 'app-keyboard-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './keyboard-section.component.html',
  styleUrl: './keyboard-section.component.scss'
})
export class KeyboardSectionComponent {

  backlight_percentage: string = 'N/A'
  update_percentage(event: MouseEvent)
  {
    this.backlight_percentage = (event.target as HTMLInputElement).value + "%"
  }

  keyboard_more(){
    console.log('more');
    invoke('open_keyboard_extra');
  }
}
