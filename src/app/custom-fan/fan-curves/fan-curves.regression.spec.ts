import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FanCurvesComponent } from "./fan-curves.component";
import { FanService } from "../../services/fan.service";

describe("Custom fan curve selection regression", () => {
  let fixture: ComponentFixture<FanCurvesComponent>;
  let loaded: () => void;
  let profiles: any[];
  let saveCurve: jasmine.Spy;
  let applyCurve: jasmine.Spy;
  let ipc: jasmine.Spy;
  let previousIpc: unknown;

  beforeEach(async () => {
    previousIpc = (window as any).__TAURI_INTERNALS__;
    ipc = jasmine.createSpy("invoke").and.resolveTo();
    (window as any).__TAURI_INTERNALS__ = { invoke: ipc };
    profiles = [
      { id: 0, name: "Default", array: [0, 10, 25], selected: false },
      { id: 1, name: "Cooling", array: [40, 55, 70], selected: true },
    ];
    const ready = new Promise<void>((resolve) => { loaded = resolve; });
    saveCurve = jasmine.createSpy("saveCurve").and.resolveTo();
    applyCurve = jasmine.createSpy("applyCurve").and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [FanCurvesComponent],
      providers: [{ provide: FanService, useValue: {
        ready, getProfiles: () => profiles, saveCurve, applyCurve,
      } }],
    }).compileComponents();
    fixture = TestBed.createComponent(FanCurvesComponent);
    fixture.detectChanges();
  });

  afterEach(() => { (window as any).__TAURI_INTERNALS__ = previousIpc; });

  async function finishLoading() {
    loaded();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function selector(): HTMLSelectElement {
    return fixture.nativeElement.querySelector("select");
  }

  it("waits for profiles and opens the applied curve even when it is not first", async () => {
    expect(selector().disabled).toBeTrue();
    expect(fixture.componentInstance.selectedIndex).toBe(-1);
    expect(fixture.nativeElement.querySelector("canvas")).toBeNull();
    await finishLoading();
    expect(selector().selectedIndex).toBe(1);
    expect(fixture.componentInstance.lineChartData.datasets[0].data).toEqual([40, 55, 70]);
  });

  it("keeps dropdown and chart together after a change and repeated rendering", async () => {
    await finishLoading();
    selector().value = selector().options[0].value;
    selector().dispatchEvent(new Event("change"));
    await fixture.whenStable();
    fixture.detectChanges();
    // The applied profile is still Cooling until Save and Apply; rendering
    // must not restore it over the curve currently being edited.
    for (let i = 0; i < 4; i++) fixture.detectChanges();
    expect(selector().selectedIndex).toBe(0);
    expect(fixture.componentInstance.selectedIndex).toBe(0);
    expect(fixture.componentInstance.lineChartData.datasets[0].data).toEqual([0, 10, 25]);
    expect(fixture.componentInstance.chart?.chart?.data.datasets[0].data).toEqual([0, 10, 25]);
    selector().dispatchEvent(new MouseEvent("click"));
    fixture.detectChanges();
    expect(selector().selectedIndex).toBe(0);
    expect(saveCurve).not.toHaveBeenCalled();
  });

  it("isolates dragged points from saved profiles and restores saved data on switching back", async () => {
    await finishLoading();
    const component = fixture.componentInstance;
    component.lineChartData.datasets[0].data[1] = 99;
    expect(profiles[1].array).toEqual([40, 55, 70]);
    component.selectProfile(0);
    component.selectProfile(1);
    expect(component.lineChartData.datasets[0].data).toEqual([40, 55, 70]);
  });

  it("saves the displayed curve without changing applied selection", async () => {
    await finishLoading();
    fixture.componentInstance.selectProfile(0);
    fixture.componentInstance.lineChartData.datasets[0].data[1] = 33;
    await fixture.componentInstance.save();
    expect(saveCurve).toHaveBeenCalledOnceWith(0, [0, 33, 25], false);
    expect(profiles[1].selected).toBeTrue();
  });

  it("does not apply if saving fails and lets the user retry", async () => {
    await finishLoading();
    saveCurve.and.rejectWith(new Error("save failed"));
    spyOn(console, "error");
    await fixture.componentInstance.saveAndApply();
    expect(fixture.componentInstance.error).toContain("Unable to save");
    expect(fixture.componentInstance.saving).toBeFalse();
    expect(fixture.componentInstance.selectedIndex).toBe(1);
    expect(ipc).not.toHaveBeenCalled();
    expect(applyCurve).not.toHaveBeenCalled();
  });

  it("applies only after persistence completes and ignores repeated save clicks", async () => {
    await finishLoading();
    let persisted!: () => void;
    saveCurve.and.returnValue(new Promise<void>((resolve) => { persisted = resolve; }));
    const pending = fixture.componentInstance.saveAndApply();
    await fixture.componentInstance.saveAndApply();
    expect(saveCurve).toHaveBeenCalledOnceWith(1, [40, 55, 70], true);
    expect(ipc).not.toHaveBeenCalled();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(selector().disabled).toBeTrue();
    persisted();
    await pending;
    expect(applyCurve).toHaveBeenCalledOnceWith("Cooling", [40, 55, 70]);
    expect(fixture.componentInstance.saving).toBeFalse();
  });

  it("uses the first curve consistently when none is marked applied", async () => {
    profiles[1].selected = false;
    await finishLoading();
    expect(selector().selectedIndex).toBe(0);
    expect(fixture.componentInstance.lineChartData.datasets[0].data).toEqual([0, 10, 25]);
  });

  it("keeps an empty profile list disabled without saving a nonexistent curve", async () => {
    profiles.length = 0;
    await finishLoading();
    expect(selector().disabled).toBeTrue();
    expect(fixture.componentInstance.selectedIndex).toBe(-1);
    await fixture.componentInstance.saveAndApply();
    expect(saveCurve).not.toHaveBeenCalled();
  });

  it("does not touch a destroyed editor when delayed loading completes", async () => {
    const component = fixture.componentInstance;
    fixture.destroy();
    loaded();
    await Promise.resolve();
    expect(component.selectedIndex).toBe(-1);
  });
});
