import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { invoke } from '@tauri-apps/api/tauri'
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-fan-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './fan-section.component.html',
  styleUrl: './fan-section.component.scss',
})
export class FanSectionComponent {
  selected_mode: string = 'N/A'
  fan_exists: boolean = !true;
  fan_class: string = '';


  fan_auto()
  {
    console.log('auto');
    this.selected_mode = 'Auto'
  }
  fan_off()
  {
    console.log('off')
    this.selected_mode = 'Off'
  }
  fan_max()
  {
    console.log('max')
    this.selected_mode = 'Max'
  }
  fan_custom()
  {
    console.log('custom')
    this.selected_mode = 'Custom'
    invoke('open_custom_fan');
  }
}
