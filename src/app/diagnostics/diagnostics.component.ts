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
  async get_info(event: MouseEvent) {
    let selected_function = (event.target as HTMLInputElement).value
    switch (selected_function) {
      case "General Information":
        console.log(selected_function);
        break;
      case "Boot Timestraps":
        console.log(selected_function);
        break;
      case "Coreboot Log":
        console.log(selected_function)
        break;
      case "Coreboot Extended Log":
        console.log(selected_function)
        break;
      case "Battery Information":
        console.log(selected_function)
        break;
      case "EC Chip Information":
        console.log(selected_function)
        break;
      case "SPI Information":
        console.log(selected_function)
        break;
      case "EC Protocol Information":
        console.log(selected_function)
        break;
      case "Temperature Sensor Information":
        console.log(selected_function)
        break;
      case "Power Delivery Information":
        console.log(selected_function);
        break;
      default:
        this.collected_info = "Select An Option"
        break;
    }
    this.collected_info = await invoke("execute", { program: "cbmem", arguments: ['-t'], reply: true })
    console.log(this.collected_info)
  }
}
