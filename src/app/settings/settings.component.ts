import { Component } from '@angular/core';
import { SliderAndTextComponent } from './slider-and-text/slider-and-text.component';
import { ButtonComponent } from '../button/button.component';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SliderAndTextComponent, ButtonComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}
