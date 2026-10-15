import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { FanService } from "../../services/fan.service";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import { UnlistenFn } from "@tauri-apps/api/event";
import { FanCurveRequest, validCurve } from "../../services/fan-control";
import { ec, zoomScale } from "../../services/device";

type Mode = "unavailable" | "auto" | "off" | "max" | "custom";

@Component({
  selector: "app-fan-section",
  imports: [],
  templateUrl: "./fan-section.component.html",
  styleUrl: "./fan-section.component.scss",
  providers: [FanService],
})
export class FanSectionComponent implements OnInit, OnDestroy {
  readonly state = signal<{ mode: Mode; name: string; curve: number[] }>({
    mode: "unavailable", name: "N/A", curve: [],
  });
  readonly selectedMode = computed(() => this.state().name);
  readonly temperature = signal<number | null>(null);
  readonly rpm = signal<number | null>(null);
  readonly fanAvailable = signal(false);
  readonly error = signal("");
  readonly fanService = inject(FanService);
  zoom = 1;
  private revision = 0;
  private destroyed = false;
  private timer?: ReturnType<typeof setTimeout>;
  private unlisten: UnlistenFn[] = [];
  private writes: Promise<unknown> = Promise.resolve();

  async ngOnInit() {
    const webview = getCurrentWebviewWindow();
    // Only main owns control, even if a secondary window renders a startup route.
    if (webview.label !== "main") return;
    const bootRevision = this.revision;
    try {
      this.keepListener(await webview.listen<FanCurveRequest>("fan_curve", (event) => {
        void this.receiveCurve(event.payload);
      }));
      this.keepListener(await webview.listen("system_resume", () => {
        if (this.isCurveMode()) void this.writeMode(this.revision).catch(() => {});
      }));
      if (this.destroyed) return;
      const output = await invoke<string>("execute", {
        program: "ectool", arguments: ["pwmgetfanrpm", "all"], reply: true,
      });
      if (!/Fan\s+\d+\s+RPM:/i.test(output)) throw new Error(output);
      this.fanAvailable.set(true);
      this.updateRPM(output);
      const boot = await invoke<string>("local_storage", {
        function: "get", option: "fan_boot", value: "",
      });
      await this.fanService.ready.catch(async (error) => {
        if (!this.destroyed && this.revision === bootRevision) await this.fan_auto();
        throw error;
      });
      if (!this.destroyed && this.revision === bootRevision) {
        const profiles = this.fanService.getProfiles();
        const selected = profiles.find((item) => item.selected) ?? profiles[0];
        if (boot === "true" && selected && validCurve(selected.array)) {
          await this.changeMode("custom", selected.name, selected.array);
        } else {
          await this.fan_auto();
        }
      }
      const percentage = Number(await invoke<string>("local_storage", {
        function: "get", option: "zoom", value: "",
      }));
      if (Number.isFinite(percentage) && percentage > 0) this.zoom = percentage / 100;
    } catch (error) {
      this.report(error);
    } finally {
      if (!this.destroyed && this.fanAvailable()) this.schedulePoll();
    }
  }

  private keepListener(unlisten: UnlistenFn) {
    if (this.destroyed) unlisten();
    else this.unlisten.push(unlisten);
  }

  private isCurveMode() {
    return this.state().mode === "custom";
  }

  private report(error: unknown) {
    console.error("fan control:", error);
    if (!this.destroyed) this.error.set("Unable to apply fan control. Please retry.");
  }

  async fan_auto() { return this.changeMode("auto", "Auto", []).catch(() => false); }
  async fan_off() { return this.changeMode("off", "Off", []).catch(() => false); }
  async fan_max() { return this.changeMode("max", "Max", []).catch(() => false); }

  private async changeMode(mode: Mode, name: string, curve: readonly number[]) {
    if (this.destroyed) return false;
    const revision = ++this.revision;
    this.error.set("");
    // Name, highlight and curve always change as one state value.
    this.state.set({ mode, name, curve: [...curve] });
    return this.writeMode(revision);
  }

  private writeMode(revision: number, sampledTemp?: number): Promise<boolean> {
    const write = this.writes.catch(() => {}).then(async () => {
      if (this.destroyed || revision !== this.revision) return false;
      const state = this.state();
      if (state.mode === "off" || state.mode === "max") {
        await invoke("set_fan_duty", { duty: state.mode === "off" ? 0 : 100 });
      } else if (state.mode === "auto") {
        await ec(["autofanctrl"]);
      } else if (state.mode === "custom") {
        const temp = sampledTemp ?? await invoke<number>("get_temps");
        if (this.destroyed || revision !== this.revision) return false;
        if (!Number.isFinite(temp) || temp <= 0) {
          this.temperature.set(null);
          await invoke("set_fan_duty", { duty: 100 });
          throw new Error("No valid temperature; using full speed");
        }
        this.temperature.set(temp);
        await invoke("set_custom_fan", { temp, array: [...state.curve] });
      }
      if (!this.destroyed && revision === this.revision) this.error.set("");
      return !this.destroyed && revision === this.revision;
    }).catch((error) => {
      if (revision === this.revision) this.report(error);
      throw error;
    });
    this.writes = write;
    return write;
  }

  private async receiveCurve(request: FanCurveRequest) {
    if (this.destroyed) return;
    let applied = false;
    try {
      if (!request || !request.name?.trim() || !validCurve(request.array)) {
        throw new Error("Invalid fan curve request");
      }
      applied = await this.changeMode("custom", request.name, request.array);
    } catch (error) { this.report(error); }
    if (request?.requestId && !this.destroyed) {
      await invoke("fan_curve_feedback", {
        result: { requestId: request.requestId, applied },
      }).catch((error) => this.report(error));
    }
  }

  private updateRPM(output: string) {
    const matches = [...output.matchAll(/Fan\s+\d+\s+RPM:\s*(\d+)/gi)];
    this.rpm.set(matches.length ? Math.max(...matches.map((m) => Number(m[1]))) : null);
  }

  private schedulePoll() {
    this.timer = setTimeout(() => { void this.poll(); }, 1000);
  }

  private async poll() {
    try {
      const temp = await invoke<number>("get_temps");
      if (this.destroyed) return;
      this.temperature.set(Number.isFinite(temp) && temp > 0 ? temp : null);
      const output = await invoke<string>("execute", {
        program: "ectool", arguments: ["pwmgetfanrpm", "all"], reply: true,
      });
      if (this.destroyed) return;
      this.updateRPM(output);
      if (this.isCurveMode()) await this.writeMode(this.revision, temp);
    } catch (error) { this.report(error); }
    finally { if (!this.destroyed) this.schedulePoll(); }
  }

  async open_fan_custom_window() {
    try {
      const value = await invoke<string>("local_storage", { function: "get", option: "zoom", value: "" });
      if (!this.destroyed) await invoke("open_window", {
        name: "Custom_Fans", width: 980, height: 540, zoom: zoomScale(value),
      });
    } catch (error) { this.report(error); }
  }

  ngOnDestroy() {
    this.destroyed = true;
    ++this.revision;
    clearTimeout(this.timer);
    this.unlisten.forEach((unlisten) => unlisten());
  }
}
