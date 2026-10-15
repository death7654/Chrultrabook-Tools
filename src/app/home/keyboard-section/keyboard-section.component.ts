import { Component, HostListener, OnDestroy, OnInit, signal } from "@angular/core";
import { ec, parseBrightness } from "../../services/device";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-keyboard-section",
  imports: [],
  templateUrl: "./keyboard-section.component.html",
  styleUrl: "./keyboard-section.component.scss",
})
export class KeyboardSectionComponent implements OnInit, OnDestroy {
  readonly brightness = signal<number | null>(null);
  readonly loading = signal(true);
  readonly unsupported = signal(false);
  readonly error = signal("");
  private confirmed = 0;
  private pending?: number;
  private writing = false;
  private destroyed = false;
  private revision = 0;

  ngOnInit() { void this.load(); }
  @HostListener("window:focus")
  refresh() { if (!this.loading() && !this.writing && !this.destroyed) void this.load(); }

  async load() {
    const revision = ++this.revision;
    this.loading.set(true);
    this.error.set("");
    try {
      const value = parseBrightness(await ec(["pwmgetkblight"]));
      if (this.destroyed || revision !== this.revision) return;
      this.confirmed = value;
      this.brightness.set(value);
      this.unsupported.set(false);
    } catch (error) {
      if (this.destroyed || revision !== this.revision) return;
      console.error("keyboard brightness:", error);
      this.unsupported.set(/not supported|unimplemented|invalid[ _]command/i.test(String(error)));
      this.error.set("Unable to read keyboard brightness. Please retry.");
    } finally {
      if (!this.destroyed && revision === this.revision) this.loading.set(false);
    }
  }

  preview(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isInteger(value) && value >= 0 && value <= 100) this.brightness.set(value);
  }

  async update_percentage(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    if (this.destroyed || this.loading() || !Number.isInteger(value) || value < 0 || value > 100) return;
    ++this.revision;
    this.brightness.set(value);
    this.pending = value;
    if (this.writing) return;
    this.writing = true;
    try {
      while (!this.destroyed && this.pending !== undefined) {
        const requested = this.pending;
        this.pending = undefined;
        try {
          const actual = await invoke<number>("set_keyboard_brightness", { percentage: requested });
          if (this.destroyed) return;
          this.confirmed = actual;
          if (this.pending === undefined) this.brightness.set(actual);
          this.error.set("");
        } catch (error) {
          if (this.destroyed) return;
          console.error("keyboard brightness:", error);
          if (this.pending === undefined) this.brightness.set(this.confirmed);
          this.error.set("Unable to change keyboard brightness. Please retry.");
        }
      }
    } finally {
      this.writing = false;
      if (!this.destroyed) (event.target as HTMLInputElement).value = String(this.brightness() ?? this.confirmed);
    }
  }

  ngOnDestroy() { this.destroyed = true; this.pending = undefined; ++this.revision; }
}
