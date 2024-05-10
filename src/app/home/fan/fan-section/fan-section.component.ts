import { Component } from '@angular/core';
import { FanButtonComponent } from '../fan-button/fan-button.component';


@Component({
  selector: 'app-fan-section',
  standalone: true,
  imports: [FanButtonComponent],
  templateUrl: './fan-section.component.html',
  styleUrl: './fan-section.component.css'
})
export class FanSectionComponent {

}
