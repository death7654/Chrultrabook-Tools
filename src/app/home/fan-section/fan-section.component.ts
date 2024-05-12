import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';


@Component({
  selector: 'app-fan-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './fan-section.component.html',
  styleUrl: './fan-section.component.scss'
})
export class FanSectionComponent {

  fan_auto()
  {
    console.log('auto')
  }
  fan_off()
  {
    console.log('off')
  }
  fan_max()
  {
    console.log('max')
  }
  fan_custom()
  {
    console.log('custom')
  }
}
