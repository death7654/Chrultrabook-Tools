import { Component, Input } from '@angular/core';
import { path } from '@tauri-apps/api';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() button_label: string | undefined
  @Input() button_class: string | undefined
  @Input() svg: string | undefined
  @Input() svg_class: string | undefined


  keyboard_more()
  {

  }
}
