import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() button_label: string | undefined
  @Input() button_class: string | undefined
  @Input() svg: string | undefined
  @Input() svg_class: string | undefined
  @Input() disabled_state: boolean | undefined;


  keyboard_more()
  {

  }
}
