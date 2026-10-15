import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { emit } from "@tauri-apps/api/event";
import { clearMocks, mockIPC, mockWindows } from "@tauri-apps/api/mocks";
import { FanSectionComponent } from "./fan-section.component";
import { FanCurvesComponent } from "../../custom-fan/fan-curves/fan-curves.component";
import { FanService } from "../../services/fan.service";

describe("Fan mode ownership and Apply integration", () => {
  let fixture: ComponentFixture<FanSectionComponent>;
  let editor: ComponentFixture<FanCurvesComponent> | undefined;
  let ipc: jasmine.Spy;
  let hook: ((cmd: string, args: any) => unknown) | undefined;
  let previousIpc: unknown;
  let previousEvents: unknown;
  const custom = [40, 55, 70, 82, 92, 100, 100, 100, 100, 100, 100, 100, 100];
  const profiles = [{ id: 0, name: "Cooling User", selected: true, array: custom }];

  beforeEach(async () => {
    previousIpc = (window as any).__TAURI_INTERNALS__;
    previousEvents = (window as any).__TAURI_EVENT_PLUGIN_INTERNALS__;
    hook = undefined;
    mockWindows("main");
    ipc = jasmine.createSpy("ipc").and.callFake(async (cmd: string, args: any) => {
      const override = hook?.(cmd, args);
      if (override !== undefined) return override;
      if (cmd === "execute") return "Fan 0 RPM: 8100\nFan 1 RPM: 8200\n";
      if (cmd === "get_temps") return 48;
      if (cmd === "get_fan_json") return JSON.stringify(profiles);
      if (cmd === "local_storage") return args.option === "fan_boot" ? "false" : "";
      if (cmd === "transfer_fan_curves") return emit("fan_curve", args.curves);
      if (cmd === "fan_curve_feedback") return emit("fan_curve_applied", args.result);
      return undefined;
    });
    mockIPC(ipc, { shouldMockEvents: true });
    await TestBed.configureTestingModule({
      imports: [FanSectionComponent, FanCurvesComponent],
      providers: [provideZonelessChangeDetection()],
    }).overrideComponent(FanSectionComponent, { set: { providers: [{
      provide: FanService, useValue: { ready: Promise.resolve(), getProfiles: () => profiles },
    }] } }).compileComponents();
    fixture = TestBed.createComponent(FanSectionComponent);
  });

  afterEach(() => {
    editor?.destroy();
    editor = undefined;
    fixture.destroy();
    clearMocks();
    (window as any).__TAURI_INTERNALS__ = previousIpc;
    (window as any).__TAURI_EVENT_PLUGIN_INTERNALS__ = previousEvents;
  });

  async function flush() {
    for (let i = 0; i < 30; i++) await Promise.resolve();
    await fixture.whenStable();
  }

  async function start() {
    fixture.detectChanges();
    await flush();
    expect(fixture.componentInstance.fanAvailable()).toBeTrue();
  }

  function buttons(): HTMLButtonElement[] {
    return [...fixture.nativeElement.querySelectorAll("button")];
  }

  function assertMode(label: string, index: number) {
    expect(fixture.nativeElement.querySelector("#selected_mode").textContent).toBe(label);
    expect(buttons().map((button) => button.classList.contains("active")))
      .toEqual([0, 1, 2, 3].map((i) => i === index));
  }

  it("Auto retains EC-managed behavior and has no Bootstrap-owned toggle", async () => {
    await start();
    assertMode("Auto", 0);
    expect(buttons()[0].hasAttribute("data-bs-toggle")).toBeFalse();
    expect(ipc).toHaveBeenCalledWith("execute_checked", { program: "ectool", arguments: ["autofanctrl"] });
    expect(ipc.calls.allArgs().some(([cmd]) => cmd === "set_custom_fan")).toBeFalse();
  });
  it("repeated Auto clicks keep exactly Auto highlighted", async () => {
    await start();
    for (let i = 0; i < 3; i++) { buttons()[0].click(); await flush(); assertMode("Auto", 0); }
  });

  it("an external Apply updates mode name and highlight without manual change detection", async () => {
    await start();
    await emit("fan_curve", { requestId: "external", name: "Cooling User", array: custom });
    await flush();
    assertMode("Cooling User", 3);
    expect(ipc).toHaveBeenCalledWith("fan_curve_feedback", {
      result: { requestId: "external", applied: true },
    });
    buttons()[0].click();
    await flush();
    assertMode("Auto", 0);
  });

  it("runs real editor Save and Apply through IPC, main write and confirmation", async () => {
    await start();
    editor = TestBed.createComponent(FanCurvesComponent);
    editor.detectChanges();
    await flush();
    await editor.whenStable();
    for (let i = 0; i < 3; i++) {
      await editor.componentInstance.saveAndApply();
      await flush();
      assertMode("Cooling User", 3);
      expect(editor.componentInstance.error).toBe("");
      await fixture.componentInstance.fan_auto();
      await flush();
      assertMode("Auto", 0);
    }
  });

  it("a late boot Auto decision cannot overwrite a curve applied in the meantime", async () => {
    let finishBoot!: (value: string) => void;
    const pendingBoot = new Promise<string>((resolve) => { finishBoot = resolve; });
    hook = (cmd, args) => cmd === "local_storage" && args.option === "fan_boot" ? pendingBoot : undefined;
    await start();
    await emit("fan_curve", { requestId: "early", name: "Cooling User", array: custom });
    await flush();
    finishBoot("false");
    await flush();
    assertMode("Cooling User", 3);
  });

  it("discards a stale temperature callback when Max supersedes Custom", async () => {
    await start();
    ipc.calls.reset();
    let finishTemp!: (value: number) => void;
    const pendingTemp = new Promise<number>((resolve) => { finishTemp = resolve; });
    hook = (cmd) => cmd === "get_temps" ? pendingTemp : undefined;
    const apply = emit("fan_curve", { requestId: "superseded", name: "Cooling User", array: custom });
    await flush();
    const max = fixture.componentInstance.fan_max();
    finishTemp(48);
    await Promise.all([apply, max]);
    await flush();
    assertMode("Max", 2);
    expect(ipc).toHaveBeenCalledWith("set_fan_duty", { duty: 100 });
    expect(ipc.calls.allArgs().some(([cmd]) => cmd === "set_custom_fan")).toBeFalse();
  });

  it("invalid temperature goes to full speed and reports failed Apply", async () => {
    await start();
    spyOn(console, "error");
    hook = (cmd) => cmd === "get_temps" ? 0 : undefined;
    await emit("fan_curve", { requestId: "invalid-temp", name: "Cooling User", array: custom });
    await flush();
    expect(ipc).toHaveBeenCalledWith("set_fan_duty", { duty: 100 });
    expect(ipc).toHaveBeenCalledWith("fan_curve_feedback", {
      result: { requestId: "invalid-temp", applied: false },
    });
  });

  it("hardware write errors are returned to the editor instead of false success", async () => {
    await start();
    spyOn(console, "error");
    editor = TestBed.createComponent(FanCurvesComponent);
    editor.detectChanges();
    await flush();
    hook = (cmd) => cmd === "set_custom_fan" ? Promise.reject(new Error("EC write failed")) : undefined;
    await editor.componentInstance.saveAndApply();
    expect(editor.componentInstance.error).toContain("Unable to save or apply");
  });

  it("a secondary window never starts a competing fan controller", async () => {
    mockWindows("Custom_Fans");
    fixture.detectChanges();
    await flush();
    expect(ipc).not.toHaveBeenCalled();
  });

  it("destroying main unregisters Apply and prevents further writes", async () => {
    await start();
    fixture.destroy();
    ipc.calls.reset();
    await emit("fan_curve", { requestId: "destroyed", name: "Cooling User", array: custom });
    await flush();
    expect(ipc).not.toHaveBeenCalled();
  });
});
