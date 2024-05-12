import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-keyboard-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './keyboard-section.component.html',
  styleUrl: './keyboard-section.component.scss'
})
export class KeyboardSectionComponent {

  backlight_percentage: string = '0%'
  update_percentage(event: MouseEvent)
  {
    this.backlight_percentage = (event.target as HTMLInputElement).value + "%"
  }

  keyboard_more(){
    console.log('more')
  }
}
