import { Component, ViewChild, ElementRef } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalSize } from '@tauri-apps/api/dpi';

@Component({
  selector: "app-custom-fan",
  imports: [RouterLink, RouterOutlet],
  templateUrl: "./custom-fan.component.html",
  styleUrl: "./custom-fan.component.scss"
})
export class CustomFanComponent {
  curves: string = "active";
  profile: string = "";
  data: string = "";

  @ViewChild('container') containerRef!: ElementRef;

  refresh() {
    window.location.reload();
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
  ngOnInit() {
    this.resizeWindowToContent();
  }

  removeActive() {
    this.curves = " ";
    this.profile = " ";
    this.data = " ";
  }

  fan_curves() {
    this.removeActive();
    this.curves = "active";
  }
  fan_profile() {
    this.removeActive();
    this.profile = "active";
  }
  fan_data_fn() {
    this.removeActive();
    this.data = "active";
  }

}


