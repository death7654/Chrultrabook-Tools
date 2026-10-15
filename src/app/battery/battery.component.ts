import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { ec } from "../services/device";

@Component({
  selector: "app-battery", imports: [],
  templateUrl: "./battery.component.html", styleUrl: "./battery.component.scss",
})
export class BatteryComponent implements OnInit, OnDestroy {
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly oldec = signal(false);
  readonly error = signal("");
  readonly status = signal("");
  private destroyed = false;
  ngOnInit() { void this.load(); }
  async load() {
    this.loading.set(true); this.error.set("");
    try {
      const output = await ec(["chargecontrol"]);
      if (!this.destroyed) { this.status.set(output.trim()); this.oldec.set(false); }
    } catch (error) {
      if (!this.destroyed) {
        this.oldec.set(/old|too old|unsupported|invalid command/i.test(String(error)));
        this.error.set("Unable to read charge settings. Some firmware only supports basic modes.");
      }
    } finally { if (!this.destroyed) this.loading.set(false); }
  }
  private async run(args: string[]) {
    if (this.busy() || this.loading()) return;
    this.busy.set(true); this.error.set(""); this.status.set("");
    try {
      const output = await ec(args);
      if (!this.destroyed) this.status.set(output.trim() || "Settings applied.");
    } catch (error) {
      console.error("battery:", error);
      if (!this.destroyed) this.error.set("Unable to apply battery settings. Check firmware support and AC power.");
    } finally { if (!this.destroyed) this.busy.set(false); }
  }
  apply_limits(value: string) {
    const upper = Number(value);
    if (!value.trim() || !Number.isInteger(upper) || upper < 5 || upper > 100) {
      this.error.set("Enter a whole percentage from 5 to 100."); return Promise.resolve();
    }
    return this.run(["chargecontrol", "normal", String(upper - 5), String(upper)]);
  }
  apply_mode(mode: string) {
    if (!["normal", "idle", "discharge"].includes(mode)) {
      this.error.set("Select a valid battery mode."); return Promise.resolve();
    }
    return this.run(["chargecontrol", mode]);
  }
  apply_maximum_current(value: string) {
    const current = Number(value);
    if (!value.trim() || !Number.isInteger(current) || current < 0 || current > 65535) {
      this.error.set("Enter a whole current from 0 to 65535 mA."); return Promise.resolve();
    }
    return this.run(["chargecurrentlimit", String(current)]);
  }
  ngOnDestroy() { this.destroyed = true; }
}
