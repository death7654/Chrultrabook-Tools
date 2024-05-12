import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-extra-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './extra-section.component.html',
  styleUrl: './extra-section.component.scss'
})
export class ExtraSectionComponent {

  diagnostic(){
    console.log('diag');
  }
  settings()
  {
    console.log('settings');
  }
}
