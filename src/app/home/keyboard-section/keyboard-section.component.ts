import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-keyboard-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './keyboard-section.component.html',
  styleUrl: './keyboard-section.component.scss'
})
export class KeyboardSectionComponent {

}
