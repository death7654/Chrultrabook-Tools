import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { version } from "../../../package.json";
import { zoomScale } from "../services/device";

@Component({
  selector: "app-settings", imports: [],
  templateUrl: "./settings.component.html", styleUrl: "./settings.component.scss",
})
export class SettingsComponent implements OnInit, OnDestroy {
  readonly version_applied = version;
  readonly linux = signal(true);
  readonly loading = signal(true);
  readonly ready = signal(false);
  readonly saving = signal(false);
  readonly error = signal("");
  readonly zoom = signal("100");
  readonly sensors = signal<{ name: string; enabled: boolean }[]>([]);
  readonly options = signal([
    { key: "fan_boot", function: "Start Custom Fan Curves On App Startup", answer: false },
    { key: "app_tray", function: "Main Window Minimizes To Tray On Exit", answer: false },
    { key: "start_app_tray", function: "Start App in System Tray", answer: false },
    { key: "app_boot", function: "Start App On Boot", answer: false },
  ]);
  private destroyed = false;

  ngOnInit() { void this.load(); }
  private read(option: string) {
    return invoke<string>("local_storage", { function: "get", option, value: "" });
  }
  private save(option: string, value: string) {
    return invoke("local_storage", { function: "save", option, value });
  }
  async load() {
    this.loading.set(true);
    this.ready.set(false);
    this.error.set("");
    try {
      const [os, values, sensorText, states, zoom] = await Promise.all([
        invoke<string>("os"),
        Promise.all(this.options().map((option) => this.read(option.key))),
        invoke<string>("get_sensors").catch((error) => {
          console.error("sensor detection:", error);
          if (!this.destroyed) this.error.set("Temperature sensors could not be read. Other settings remain available.");
          return "";
        }), this.read("sensor_selection"), this.read("zoom"),
      ]);
      if (this.destroyed) return;
      this.linux.set(os === "linux");
      this.options.update((options) => options.map((option, i) => ({ ...option, answer: values[i] === "true" })));
      const saved = states.trim().split(/\s+/);
      const names = sensorText.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
      const sensors = names.map((name, i) => ({ name, enabled: saved[i] !== "false" }));
      if (sensors.length && sensors.every((sensor) => !sensor.enabled)) sensors.forEach((sensor) => sensor.enabled = true);
      this.sensors.set(sensors);
      this.zoom.set(String(zoomScale(zoom) * 100));
      this.ready.set(true);
    } catch (error) {
      console.error("settings load:", error);
      if (!this.destroyed) this.error.set("Unable to load settings. Please retry.");
    } finally { if (!this.destroyed) this.loading.set(false); }
  }

  async toggle(index: number, checked: boolean, input?: HTMLInputElement) {
    if (!this.ready() || this.loading() || this.saving()) return;
    const option = this.options()[index];
    if (!option) return;
    this.saving.set(true);
    this.error.set("");
    let autostartChanged = false;
    try {
      if (option.key === "app_boot") {
        await invoke("autostart", { value: checked });
        autostartChanged = true;
      }
      await this.save(option.key, String(checked));
      if (!this.destroyed) this.options.update((options) => options.map((item, i) =>
        i === index ? { ...item, answer: checked } : item));
    } catch (error) {
      if (autostartChanged) await invoke("autostart", { value: option.answer }).catch(console.error);
      console.error("settings save:", error);
      if (!this.destroyed) {
        this.options.update((options) => options.map((item) => ({ ...item })));
        this.error.set("Unable to save settings. The previous value was kept.");
      }
    } finally {
      if (input) input.checked = this.options()[index].answer;
      if (!this.destroyed) this.saving.set(false);
    }
  }

  async update_zoom(value: string, input?: HTMLSelectElement) {
    if (!this.ready() || this.saving() || this.loading()) return;
    const scale = zoomScale(value);
    const previous = this.zoom();
    this.saving.set(true);
    try {
      await invoke("setzoom", { scale });
      await this.save("zoom", String(scale * 100));
      if (!this.destroyed) { this.zoom.set(String(scale * 100)); this.error.set(""); }
    } catch (error) {
      await invoke("setzoom", { scale: zoomScale(previous) }).catch(console.error);
      if (!this.destroyed) this.error.set("Unable to save zoom. The previous value was kept.");
    } finally {
      if (input) input.value = this.zoom();
      if (!this.destroyed) this.saving.set(false);
    }
  }

  async change_sensor(index: number, checked: boolean, input?: HTMLInputElement) {
    if (!this.ready() || this.loading() || this.saving()) return;
    const next = this.sensors().map((sensor, i) => i === index ? { ...sensor, enabled: checked } : { ...sensor });
    if (!next.some((sensor) => sensor.enabled)) {
      this.sensors.update((sensors) => sensors.map((sensor) => ({ ...sensor })));
      this.error.set("Keep at least one temperature sensor selected.");
      if (input) input.checked = this.sensors()[index].enabled;
      return;
    }
    this.saving.set(true);
    try {
      await this.save("sensor_selection", next.map((sensor) => String(sensor.enabled)).join(" "));
      if (!this.destroyed) { this.sensors.set(next); this.error.set(""); }
    } catch (error) {
      if (!this.destroyed) {
        this.sensors.update((sensors) => sensors.map((sensor) => ({ ...sensor })));
        this.error.set("Unable to save sensor selection.");
      }
    } finally {
      if (input) input.checked = this.sensors()[index].enabled;
      if (!this.destroyed) this.saving.set(false);
    }
  }

  async confirmReset() {
    if (!confirm("Reset all application settings and restart?")) return;
    try { await invoke("reset"); }
    catch (error) { this.error.set("Unable to reset settings."); console.error(error); }
  }
  ngOnDestroy() { this.destroyed = true; }
}
