import { Component, OnInit } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";

@Component({
    selector: "app-diagnostics",
    imports: [],
    templateUrl: "./diagnostics.component.html",
    styleUrl: "./diagnostics.component.scss"
})
export class DiagnosticsComponent implements OnInit {
  collected_info: string = "";
  selected_function: string = "";
  disabled: boolean = false;
  ectools: boolean = false;

  ngOnInit() {
    invoke("os").then(os => {
      if (os == "macOS") {
        this.disabled = true;
      }
    });
    invoke("execute", {
      program: "ectool",
      arguments: ["hello"],
      reply: true
    }).then((event: any) => {
      let output = event.toLowerCase().trim();
      console.log(output);
      if (output !== "ec says hello!") {
        this.ectools = true;
        this.collected_info = "You are missing the ECTOOL Binary";
      }
    });

    invoke("execute", {
      program: "cbmem",
      arguments: ["-v"],
      reply: true
    }).then((event: any) => {
      let output = event
        .toLowerCase()
        .trim()
        .split(" ");
      if (output[0] !== "cbmem") {
        this.disabled = true;
        if (this.ectools == true) {
          this.collected_info = "You are missing ECTOOL and CBMEM Binaries";
        } else {
          this.collected_info = "You are missing the CBMEM Binary";
        }
      }
    });
  }

  async select() {
    this.selected_function = (document.getElementById(
      "diagnostic_dropdown"
    ) as HTMLInputElement).value;
    if (this.selected_function !== "Select") {
      this.collected_info = await invoke("diagnostics", {
        selected: this.selected_function
      });
    }
  }

  async copy_to_clipboard() {
    invoke("copy", { text: this.collected_info });
  }

  save() {
    invoke("save", {
      filename: this.selected_function,
      content: this.collected_info
    });
  }
}
