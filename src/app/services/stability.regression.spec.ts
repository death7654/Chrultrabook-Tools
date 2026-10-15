import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { KeyboardSectionComponent } from "../home/keyboard-section/keyboard-section.component";
import { SettingsComponent } from "../settings/settings.component";
import { BatteryComponent } from "../battery/battery.component";
import { DiagnosticsComponent } from "../diagnostics/diagnostics.component";
import { FanDataComponent } from "../custom-fan/fan-data/fan-data.component";
import { RgbKeyboardComponent } from "../keyboard-extra/rgb-keyboard/rgb-keyboard.component";
import { KeyboardRemapComponent } from "../keyboard-extra/keyboard-remap/keyboard-remap.component";
import { parseBrightness, zoomScale } from "./device";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}
async function flush() { for (let i = 0; i < 12; i++) await Promise.resolve(); }

describe("Keyboard brightness stability", () => {
  let fixture: ComponentFixture<KeyboardSectionComponent>;
  let ipc: jasmine.Spy;
  let previous: unknown;
  let hardware: number;
  beforeEach(async () => {
    previous = (window as any).__TAURI_INTERNALS__;
    hardware = 0;
    ipc = jasmine.createSpy("ipc").and.callFake((cmd: string, args: any) => {
      if (cmd === "set_keyboard_brightness") { hardware = args.percentage; return Promise.resolve(hardware); }
      return Promise.resolve(hardware ? `Current keyboard backlight percent: ${hardware}` : "Keyboard backlight disabled.");
    });
    (window as any).__TAURI_INTERNALS__ = { invoke: ipc };
    await TestBed.configureTestingModule({ imports: [KeyboardSectionComponent], providers: [provideZonelessChangeDetection()] }).compileComponents();
    fixture = TestBed.createComponent(KeyboardSectionComponent);
  });
  afterEach(() => { fixture.destroy(); (window as any).__TAURI_INTERNALS__ = previous; });
  function slider(): HTMLInputElement { return fixture.nativeElement.querySelector("input"); }
  async function ready() { fixture.detectChanges(); await flush(); await fixture.whenStable(); fixture.detectChanges(); }
  function change(value: number) {
    slider().value = String(value);
    slider().dispatchEvent(new Event("input")); slider().dispatchEvent(new Event("change"));
  }
  it("treats disabled backlight as supported 0%, then allows 30%, 60% and 0%", async () => {
    await ready();
    for (const value of [30, 60, 0]) {
      change(value); await flush(); await fixture.whenStable(); fixture.detectChanges();
      expect(slider().disabled).toBeFalse(); expect(Number(slider().value)).toBe(value);
      expect(fixture.componentInstance.brightness()).toBe(value); expect(hardware).toBe(value);
    }
    expect(ipc.calls.allArgs().filter((args) => args[0] === "set_keyboard_brightness").map((args) => args[1].percentage)).toEqual([30, 60, 0]);
  });
  it("keeps controls disabled until delayed detection completes", async () => {
    const read = deferred<string>(); ipc.and.returnValue(read.promise);
    fixture.detectChanges(); expect(slider().disabled).toBeTrue();
    read.resolve("Keyboard backlight disabled."); await flush(); await fixture.whenStable(); fixture.detectChanges();
    expect(slider().disabled).toBeFalse(); expect(fixture.componentInstance.unsupported()).toBeFalse();
  });
  it("serializes rapid updates and keeps only the latest queued target", async () => {
    await ready(); const first = deferred<number>(); let writes = 0;
    ipc.and.callFake((cmd: string, args: any) => {
      if (cmd === "set_keyboard_brightness") {
        hardware = args.percentage; return ++writes === 1 ? first.promise : Promise.resolve(hardware);
      }
      return Promise.resolve(`Current keyboard backlight percent: ${hardware}`);
    });
    change(30); change(50); change(70);
    expect(writes).toBe(1); first.resolve(30); await flush(); await fixture.whenStable(); fixture.detectChanges();
    expect(writes).toBe(2); expect(hardware).toBe(70); expect(Number(slider().value)).toBe(70);
  });
  it("rolls a failed write back without permanently disabling the slider", async () => {
    await ready(); ipc.and.rejectWith("EC busy"); change(30);
    await flush(); await fixture.whenStable(); fixture.detectChanges();
    expect(slider().disabled).toBeFalse(); expect(Number(slider().value)).toBe(0);
    expect(fixture.componentInstance.error()).toContain("retry");
  });
  it("retries a transient detection failure and recovers", async () => {
    ipc.and.rejectWith("busy"); await ready();
    expect(fixture.componentInstance.unsupported()).toBeFalse();
    ipc.and.resolveTo("Current keyboard backlight percent: 30");
    await fixture.componentInstance.load(); await flush(); await fixture.whenStable(); fixture.detectChanges();
    expect(Number(slider().value)).toBe(30); expect(slider().disabled).toBeFalse();
  });
  it("discards stale detection results after destruction", async () => {
    const read = deferred<string>(); ipc.and.returnValue(read.promise); fixture.detectChanges();
    fixture.destroy(); read.resolve("Current keyboard backlight percent: 90"); await flush();
    expect(fixture.componentInstance.brightness()).toBeNull();
  });
  it("recognizes firmware INVALID_COMMAND as unsupported without confusing zero brightness", async () => {
    ipc.and.rejectWith("EC result 1 (INVALID_COMMAND)"); await ready();
    expect(slider().disabled).toBeTrue(); expect(fixture.componentInstance.unsupported()).toBeTrue();
  });
});

describe("Device response validation", () => {
  it("accepts 0 and 100 while rejecting malformed brightness", () => {
    expect(parseBrightness("Keyboard backlight disabled.")).toBe(0);
    expect(parseBrightness("Current keyboard backlight percent: 100")).toBe(100);
    expect(() => parseBrightness("EC error 30")).toThrow();
    expect(() => parseBrightness("Current keyboard backlight percent: 120")).toThrow();
  });
  it("defaults missing or invalid zoom to 100%", () => {
    for (const value of ["", "0", "NaN", "-1", "500"]) expect(zoomScale(value)).toBe(1);
    expect(zoomScale("125")).toBe(1.25);
  });
});

describe("Settings save and rollback", () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let ipc: jasmine.Spy;
  let previous: unknown;
  beforeEach(async () => {
    previous = (window as any).__TAURI_INTERNALS__;
    ipc = jasmine.createSpy("ipc").and.callFake((cmd: string, args: any) => Promise.resolve(
      cmd === "os" ? "not macOS" : cmd === "get_sensors" ? "DDR\nSOC" : args?.option === "sensor_selection" ? "true true" : ""));
    (window as any).__TAURI_INTERNALS__ = { invoke: ipc };
    await TestBed.configureTestingModule({ imports: [SettingsComponent], providers: [provideZonelessChangeDetection()] }).compileComponents();
    fixture = TestBed.createComponent(SettingsComponent); fixture.detectChanges(); await flush(); await fixture.whenStable(); fixture.detectChanges();
    ipc.calls.reset();
  });
  afterEach(() => { fixture.destroy(); (window as any).__TAURI_INTERNALS__ = previous; });
  it("uses unique sensor labels and defaults missing zoom", () => {
    expect(fixture.nativeElement.querySelector("#zoom").value).toBe("100");
    const labels = [...fixture.nativeElement.querySelectorAll("#sensor_area label")] as HTMLLabelElement[];
    expect(labels.map((label) => label.htmlFor)).toEqual(["sensor-0", "sensor-1"]);
  });
  it("keeps other settings usable when sensor hardware is unavailable", async () => {
    ipc.and.callFake((cmd: string) => cmd === "get_sensors" ? Promise.reject("unavailable") : Promise.resolve(cmd === "os" ? "not macOS" : ""));
    await fixture.componentInstance.load(); fixture.detectChanges();
    expect(fixture.componentInstance.ready()).toBeTrue(); expect(fixture.nativeElement.querySelector("#fan_boot").disabled).toBeFalse();
    expect(fixture.componentInstance.error()).toContain("Other settings");
  });
  it("blocks saves after settings could not be read", async () => {
    ipc.and.rejectWith("invalid settings JSON"); await fixture.componentInstance.load(); fixture.detectChanges(); ipc.calls.reset();
    expect(fixture.nativeElement.querySelector("#fan_boot").disabled).toBeTrue();
    await fixture.componentInstance.toggle(0, true); expect(ipc).not.toHaveBeenCalled();
  });  it("restores the native checkbox after a failed persistence call", async () => {
    ipc.and.rejectWith("disk full");
    const input = fixture.nativeElement.querySelector("#fan_boot") as HTMLInputElement;
    input.checked = true; input.dispatchEvent(new Event("change")); await flush(); await fixture.whenStable(); fixture.detectChanges();
    expect(input.checked).toBeFalse(); expect(fixture.componentInstance.options()[0].answer).toBeFalse();
    expect(fixture.componentInstance.error()).toContain("previous");
  });
  it("rolls autostart back if saving the preference fails", async () => {
    ipc.and.callFake((cmd: string) => cmd === "local_storage" ? Promise.reject("disk full") : Promise.resolve());
    await fixture.componentInstance.toggle(3, true);
    expect(ipc.calls.allArgs().filter((args) => args[0] === "autostart").map((args) => args[1].value)).toEqual([true, false]);
  });
  it("keeps at least one sensor selected and restores its checkbox", async () => {
    const component = fixture.componentInstance;
    await component.change_sensor(0, false); fixture.detectChanges();
    const last = fixture.nativeElement.querySelector("#sensor-1") as HTMLInputElement;
    last.checked = false; last.dispatchEvent(new Event("change")); await flush(); await fixture.whenStable(); fixture.detectChanges();
    expect(last.checked).toBeTrue(); expect(component.sensors()[1].enabled).toBeTrue();
    expect(ipc.calls.allArgs().filter((args) => args[0] === "local_storage").length).toBe(1);
  });
  it("restores both window zoom and select value when storage fails", async () => {
    ipc.and.callFake((cmd: string) => cmd === "local_storage" ? Promise.reject("disk full") : Promise.resolve());
    const input = fixture.nativeElement.querySelector("#zoom") as HTMLSelectElement;
    input.value = "150"; input.dispatchEvent(new Event("change")); await flush(); await fixture.whenStable(); fixture.detectChanges();
    expect(input.value).toBe("100");
    expect(ipc.calls.allArgs().filter((args) => args[0] === "setzoom").map((args) => args[1].scale)).toEqual([1.5, 1]);
  });
});

describe("Battery, diagnostics and collection lifecycles", () => {
  let ipc: jasmine.Spy;
  let previous: unknown;
  beforeEach(() => {
    previous = (window as any).__TAURI_INTERNALS__;
    ipc = jasmine.createSpy("ipc").and.resolveTo("ok");
    (window as any).__TAURI_INTERNALS__ = { invoke: ipc };
  });
  afterEach(() => { (window as any).__TAURI_INTERNALS__ = previous; });
  it("sends the selected battery mode and numeric limits as strings", async () => {
    const battery = new BatteryComponent(); battery.loading.set(false);
    await battery.apply_mode("idle"); await battery.apply_limits("80"); await battery.apply_maximum_current("2500");
    expect(ipc.calls.allArgs().map((args) => args[1].arguments)).toEqual([
      ["chargecontrol", "idle"], ["chargecontrol", "normal", "75", "80"], ["chargecurrentlimit", "2500"],
    ]);
  });
  it("blocks empty, negative, fractional and out-of-range battery requests", async () => {
    const battery = new BatteryComponent(); battery.loading.set(false);
    for (const value of ["", "4", "101", "30.5", "NaN"]) await battery.apply_limits(value);
    for (const value of ["", "-1", "65536", "1.5"]) await battery.apply_maximum_current(value);
    await battery.apply_mode("bad"); expect(ipc).not.toHaveBeenCalled();
  });
  it("re-enables battery actions after a failed command", async () => {
    const battery = new BatteryComponent(); battery.loading.set(false); ipc.and.rejectWith("unsupported");
    await battery.apply_mode("normal"); expect(battery.busy()).toBeFalse(); expect(battery.error()).toContain("Unable");
  });
  it("keeps the latest diagnostic report when responses arrive out of order", async () => {
    const diagnostics = new DiagnosticsComponent(); const first = deferred<string>(); const second = deferred<string>();
    ipc.and.returnValues(first.promise, second.promise);
    const a = diagnostics.select("Battery Information"); const b = diagnostics.select("EC Chip Information");
    second.resolve("new report"); await b; first.resolve("old report"); await a;
    expect(diagnostics.collected_info()).toBe("new report"); expect(diagnostics.loading()).toBeFalse();
  });
  it("clears diagnostics when Select is chosen and ignores outstanding results", async () => {
    const diagnostics = new DiagnosticsComponent(); const first = deferred<string>(); ipc.and.returnValue(first.promise);
    const report = diagnostics.select("Battery Information"); await diagnostics.select("Select"); first.resolve("old"); await report;
    expect(diagnostics.collected_info()).toBe(""); expect(diagnostics.loading()).toBeFalse();
  });
  it("stops collection and drops an in-flight sample on destruction", async () => {
    const graph = new FanDataComponent(); const sample = deferred<number>(); ipc.and.returnValue(sample.promise);
    graph.collect("1000"); const request = graph.showData(); graph.ngOnDestroy(); sample.resolve(45); await request;
    expect(graph.collecting()).toBeFalse(); expect(graph.interval).toBeUndefined(); expect(graph.data_cpu).toEqual([]);
    expect(ipc).toHaveBeenCalledTimes(1);
  });
  it("does not overlap slow graph samples", async () => {
    const graph = new FanDataComponent(); const sample = deferred<number>();
    ipc.and.callFake((cmd: string) => cmd === "get_temps" ? sample.promise : Promise.resolve("Fan 0 RPM: 5000\nFan 1 RPM: 5500"));
    graph.collect("1000"); const first = graph.showData(); await graph.showData(); expect(ipc).toHaveBeenCalledTimes(1);
    sample.resolve(45); await first; expect(graph.data_rpm).toEqual([5500]); graph.ngOnDestroy();
  });
  it("preserves all-data view while keeping the last ten samples bounded", async () => {
    const graph = new FanDataComponent();
    ipc.and.callFake((cmd: string) => Promise.resolve(cmd === "get_temps" ? 45 : "Fan 0 RPM: 5000"));
    graph.collect("1000"); graph.retrieveCollectedData();
    for (let i = 0; i < 12; i++) await graph.showData();
    expect(graph.tiny_cpu.length).toBe(10); expect(graph.data_cpu.length).toBe(12);
    expect(graph.lineChartData.datasets[0].data.length).toBe(12);
    graph.clear(); expect(graph.label).toBe(0); expect(graph.lineChartData.datasets[0].data).toEqual([]); graph.ngOnDestroy();
  });
  it("drops a sample that was pending when Clear was clicked", async () => {
    const graph = new FanDataComponent(); const sample = deferred<number>(); ipc.and.returnValue(sample.promise);
    graph.collect("1000"); const request = graph.showData(); graph.clear(); sample.resolve(45); await request;
    expect(graph.data_cpu).toEqual([]); graph.ngOnDestroy();
  });
  it("rejects malformed graph intervals without starting a timer", () => {
    const graph = new FanDataComponent(); graph.collect("0"); expect(graph.interval).toBeUndefined(); graph.ngOnDestroy();
  });
  it("waits for RGB profile deletion persistence without reloading the window", async () => {
    const rgb = new RgbKeyboardComponent({ detectChanges() {} } as any);
    const saved = deferred<void>(); rgb.customProfiles = [{ id: 1 } as any, { id: 2 } as any];
    ipc.and.callFake((_cmd: string, args: any) => args.function === "get" ? Promise.resolve(JSON.stringify(rgb.customProfiles)) : saved.promise);
    const deletion = rgb.delete_profile(1); await flush(); expect(rgb.customProfiles.length).toBe(2);
    saved.resolve(); await deletion; expect(rgb.customProfiles.map((profile) => profile.id)).toEqual([2]); rgb.ngOnDestroy();
  });
  it("retains RGB profiles on a failed delete and permits retry", async () => {
    const rgb = new RgbKeyboardComponent({ detectChanges() {} } as any); rgb.customProfiles = [{ id: 1 } as any];
    ipc.and.callFake((_cmd: string, args: any) => args.function === "get" ? Promise.resolve(JSON.stringify(rgb.customProfiles)) : Promise.reject("disk full"));
    await rgb.delete_profile(1); expect(rgb.customProfiles.length).toBe(1); expect(rgb.busy()).toBeFalse(); expect(rgb.error()).toContain("Unable"); rgb.ngOnDestroy();
  });
  it("reports remap cancellation instead of treating it as success", async () => {
    const remap = new KeyboardRemapComponent({ detectChanges() {} } as any);
    remap.loading.set(false); remap.fullConfig = { configs: [] } as any; ipc.and.resolveTo(false);
    await remap.exportConfigJSON(); expect(remap.status()).toBe("Save cancelled."); expect(remap.saving()).toBeFalse(); remap.ngOnDestroy();
  });
});
