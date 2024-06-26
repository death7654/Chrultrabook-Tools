import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [],
  templateUrl: './diagnostics.component.html',
  styleUrl: './diagnostics.component.scss'
})
export class DiagnosticsComponent {
  collected_info: string = "";
  selected_function: string = "";
  disabled: boolean = false;

  async ngOnInit()
  {
    let os = await invoke("os");
    if(os == "macOS")
      {
        this.disabled = true;
      }
  }

  async select()
  {
    this.selected_function = (document.getElementById("diagnostic_dropdown") as HTMLInputElement).value
    if(this.selected_function !== "Select")
      {
        this.collected_info = await invoke("diagnostics", {selected: this.selected_function})
      }
  }

  async copy_to_clipboard()
  {
    invoke("copy",{text: this.collected_info})
  }

  save()
  {
    invoke("save", {filename: this.selected_function, content: this.collected_info});
  }
}
