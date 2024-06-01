import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './diagnostics.component.html',
  styleUrl: './diagnostics.component.scss'
})
export class DiagnosticsComponent {
  collected_info: string = ""
  async get_info(event: MouseEvent)
  {
    let selected_function = (event.target as HTMLInputElement).value
    console.log(selected_function)
    this.collected_info = await invoke("execute", {program: "cbmem", arguments: ['', '', ''], reply: true})
  }
}
