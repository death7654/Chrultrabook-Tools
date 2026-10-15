import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ec } from "../services/device";

@Component({
  selector: "app-keyboard-extra", imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./keyboard-extra.component.html", styleUrl: "./keyboard-extra.component.scss",
})
export class KeyboardExtraComponent implements OnInit, OnDestroy {
  current_title = "Keyboard Remapping";
  current_img = "../../assets/keyboard/keyboard.svg";
  readonly rgb_enabled = signal(true);
  readonly error = signal("");
  private destroyed = false;
  async ngOnInit() {
    try {
      await ec(["rgbkbd", "getconfig"]);
      if (!this.destroyed) this.rgb_enabled.set(false);
    } catch (error) {
      if (!this.destroyed && !/invalid[ _]command|unsupported|not supported/i.test(String(error)))
        this.error.set("Unable to detect RGB support. Reopen this window to retry.");
    }
  }
  keyboard_remap() { this.current_title = "Keyboard Remapping"; this.current_img = "../../assets/keyboard/keyboard.svg"; }
  rgb() { this.current_title = "RGB Lighting Control"; this.current_img = "../../assets/activity_light/activity.svg"; }
  ngOnDestroy() { this.destroyed = true; }
}
