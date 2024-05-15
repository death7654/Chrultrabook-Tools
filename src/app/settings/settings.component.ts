import { Component } from '@angular/core';
import { SliderAndTextComponent } from './slider-and-text/slider-and-text.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SliderAndTextComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}
