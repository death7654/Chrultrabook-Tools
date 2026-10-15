import { Component, provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { CustomFanComponent } from "./custom-fan.component";
import { FanCurvesComponent } from "./fan-curves/fan-curves.component";
import { FanService } from "../services/fan.service";

@Component({ template: "<p>Profile list</p>" })
class ProfilesStub {}

describe("Custom window viewport and resize regression", () => {
  let fixture: ComponentFixture<CustomFanComponent>;
  let router: Router;
  let previousIpc: unknown;
  let ipc: jasmine.Spy;

  beforeEach(async () => {
    previousIpc = (window as any).__TAURI_INTERNALS__;
    ipc = jasmine.createSpy("ipc").and.resolveTo();
    (window as any).__TAURI_INTERNALS__ = { invoke: ipc };
    await TestBed.configureTestingModule({
      imports: [CustomFanComponent, FanCurvesComponent, ProfilesStub],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: "fan_curves", component: FanCurvesComponent },
          { path: "fan_profiles", component: ProfilesStub },
        ]),
        { provide: FanService, useValue: {
          ready: Promise.resolve(),
          getProfiles: () => [{ id: 0, name: "Cooling", selected: true, array: [40, 55, 70] }],
        } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomFanComponent);
    fixture.nativeElement.style.width = "900px";
    fixture.nativeElement.style.height = "540px";
    fixture.detectChanges();
    router = TestBed.inject(Router);
    await router.navigateByUrl("/fan_curves");
    await settle();
  });

  afterEach(() => {
    fixture.destroy();
    (window as any).__TAURI_INTERNALS__ = previousIpc;
  });

  async function settle() {
    await fixture.whenStable();
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    fixture.detectChanges();
  }

  function chartComponent(): FanCurvesComponent {
    const outlet = fixture.debugElement.children[0].children[1].children[1];
    const chart = outlet.children.find((child) => child.componentInstance instanceof FanCurvesComponent);
    if (!chart) throw new Error("Curve editor was not rendered");
    return chart.componentInstance;
  }

  it("repeated resize keeps the same editor and unsaved draft without native resizing", async () => {
    const editor = chartComponent();
    editor.lineChartData.datasets[0].data[1] = 66;
    const initialHeight = fixture.nativeElement.querySelector(".custom-shell").getBoundingClientRect().height;
    for (let i = 0; i < 5; i++) window.dispatchEvent(new Event("resize"));
    await settle();
    expect(chartComponent()).toBe(editor);
    expect(chartComponent().lineChartData.datasets[0].data[1]).toBe(66);
    expect(fixture.nativeElement.querySelector(".custom-shell").getBoundingClientRect().height).toBe(initialHeight);
    expect(ipc).not.toHaveBeenCalled();
  });

  it("header, toolbar and canvas remain inside the viewport at two window sizes", async () => {
    for (const [width, height] of [[900, 540], [680, 420]]) {
      fixture.nativeElement.style.width = width + "px";
      fixture.nativeElement.style.height = height + "px";
      window.dispatchEvent(new Event("resize"));
      await settle();
      const shell = fixture.nativeElement.querySelector(".custom-shell").getBoundingClientRect();
      const canvas = fixture.nativeElement.querySelector("canvas").getBoundingClientRect();
      expect(shell.height).toBe(height);
      expect(canvas.bottom).toBeLessThanOrEqual(shell.bottom + 1);
      expect(canvas.right).toBeLessThanOrEqual(shell.right + 1);
      expect(canvas.height).toBeGreaterThan(100);
    }
  });

  it("changing tabs updates route selection without growing the page", async () => {
    const shell = fixture.nativeElement.querySelector(".custom-shell");
    const height = shell.getBoundingClientRect().height;
    await router.navigateByUrl("/fan_profiles");
    await settle();
    expect(fixture.nativeElement.querySelectorAll("nav button.active").length).toBe(1);
    expect(fixture.nativeElement.querySelector("nav button.active").textContent).toContain("Profiles");
    await router.navigateByUrl("/fan_curves");
    await settle();
    expect(shell.getBoundingClientRect().height).toBe(height);
    expect(fixture.nativeElement.querySelector("nav button.active").textContent).toContain("Fan Curves");
  });
});
