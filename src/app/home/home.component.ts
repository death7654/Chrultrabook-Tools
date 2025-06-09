import { Component } from "@angular/core";
import { FanSectionComponent } from "./fan-section/fan-section.component";
import { KeyboardSectionComponent } from "./keyboard-section/keyboard-section.component";
import { ActivityLightSectionComponent } from "./activity-light-section/activity-light-section.component";
import { ExtraSectionComponent } from "./extra-section/extra-section.component";
import { invoke } from "@tauri-apps/api/core";
import { ElementRef, ViewChild } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalSize } from '@tauri-apps/api/dpi';




@Component({
  selector: "app-home",
  imports: [
    FanSectionComponent,
    KeyboardSectionComponent,
    ActivityLightSectionComponent,
    ExtraSectionComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss"
})
export class HomeComponent {

  class: string = " ";
  open: number = 0;

  @ViewChild('container') containerRef!: ElementRef;

   
  private resizeWindowToContent() {
    let el = this.containerRef.nativeElement as HTMLElement;
    let rect = el.getBoundingClientRect();

    let width = Math.ceil(rect.width);
    let height = Math.ceil(rect.height); // Add padding for window decorations

    let appWindow = getCurrentWindow();
    let size = new LogicalSize(width, height);
    appWindow.setSize(size);
  }

  ngOnInit() {
    setTimeout(() => {
      invoke("execute", {
        program: "ectool",
        arguments: ["hello"],
        reply: true,
      }).then((event: any) => {
        let output = event.toLowerCase().trim();
        if (output == "ec says hello!") {
          this.class = "displaynone"
        }
      });
    })
    setTimeout(()=>{
      this.resizeWindowToContent();
      console.log('resize')
    },1500)

    invoke("os").then((os) => 
    {
      if(typeof os === "string")
      {
        if(os != "linux")
        {
          invoke("local_storage", {
            function: "get",
            option: "zoom",
            value: "",
          }).then((percentage) => {
            if (typeof percentage === "string") {
              const number = Number(percentage) / 100;
              invoke("setzoom", { scale: number });
            }
          });
        }
      }
    })

  }

  

}
