import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { invoke } from '@tauri-apps/api/tauri'

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
    invoke('open_diagnostics');
  }
  settings()
  {
    console.log('settings');
    invoke('open_settings');
  }
}
