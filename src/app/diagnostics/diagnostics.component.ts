import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { invoke } from '@tauri-apps/api/core';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

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
      case "Boot Timestraps":
        this.collected_info = await invoke("execute", { program: "cbmem", arguments: ['-t'], reply: true })
        break;
      case "Coreboot Log":
        this.collected_info = await invoke("execute", { program: "cbmem", arguments: ['-c1'], reply: true })
        break;
      case "Coreboot Extended Log":
        this.collected_info = await invoke("execute", { program: "cbmem", arguments: ['-c'], reply: true })
        break;
      case "EC Console Log":
        this.collected_info = await invoke("execute", { program: "ectool", arguments: ['console'], reply: true })
        break;
      case "Battery Information":
        this.collected_info = await invoke("execute", { program: "ectool", arguments: ['battery'], reply: true })
        break;
      case "EC Chip Information":
        this.collected_info = await invoke("execute", { program: "ectool", arguments: ['chipinfo'], reply: true })
        break;
      case "SPI Information":
        this.collected_info = await invoke("execute", { program: "ectool", arguments: ['flashspiinfo'], reply: true })
        break;
      case "EC Protocol Information":
        this.collected_info = await invoke("execute", { program: "ectool", arguments: ['protoinfo'], reply: true })
        break;
      case "Temperature Sensor Information":
        this.collected_info = await invoke("execute", { program: "ectool", arguments: ['tempsinfo',"all"], reply: true })
        break;
      case "Power Delivery Information":
        this.collected_info = await invoke("execute", { program: "ectool", arguments: ['pdlog'], reply: true })
        break;
      default:
        this.collected_info = "Select An Option"
        break;
    }
  }
  async copy_to_clipboard()
  {
    invoke("copy_to_clipboard",{text: this.collected_info})
    console.log('click')
  }
}
