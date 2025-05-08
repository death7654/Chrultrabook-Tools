import { Component } from "@angular/core";
import { FanSectionComponent } from "./fan-section/fan-section.component";
import { KeyboardSectionComponent } from "./keyboard-section/keyboard-section.component";
import { ActivityLightSectionComponent } from "./activity-light-section/activity-light-section.component";
import { ExtraSectionComponent } from "./extra-section/extra-section.component";
import { invoke } from "@tauri-apps/api/core";
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
export class HomeComponent implements AfterViewInit {

  class: string = " "
  @ViewChild('container') containerRef!: ElementRef;

  async ngAfterViewInit() {
    setTimeout(() => this.resizeWindowToContent(), 100);
    console.log('resized');
  }

  ngOnInit()
  {
    setTimeout(() => {
      invoke("execute", {
        program: "ectool",
        arguments: ["hello"],
        reply: true,
      }).then((event: any) =>
      {
        let output = event.toLowerCase().trim();
        if (output == "ec says hello!")
        {
          this.class = "displaynone"
        }
      });
    })
    this.resizeWindowToContent();
  }

  private async resizeWindowToContent() {
    const el = this.containerRef.nativeElement as HTMLElement;
    const rect = el.getBoundingClientRect();

    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height + 10); // Add padding for window decorations

    const appWindow = getCurrentWindow();
    const size = new LogicalSize(width, height);
    await appWindow.setSize(size);
  }

}
