import { TestBed } from "@angular/core/testing";
import { FanService } from "./fan.service";

describe("Fan profile persistence regression", () => {
  let ipc: jasmine.Spy;
  let service: FanService;
  let previous: unknown;
  const profiles = [
    { id: 0, name: "Default", array: [0, 10, 25], selected: true },
    { id: 1, name: "Cooling", array: [40, 55, 70], selected: false },
  ];

  beforeEach(async () => {
    previous = (window as any).__TAURI_INTERNALS__;
    ipc = jasmine.createSpy("invoke").and.callFake((cmd: string) =>
      Promise.resolve(cmd === "get_fan_json" ? JSON.stringify(profiles) : ""));
    (window as any).__TAURI_INTERNALS__ = { invoke: ipc };
    TestBed.configureTestingModule({});
    service = TestBed.inject(FanService);
    await service.ready;
    ipc.calls.reset();
  });

  afterEach(() => { (window as any).__TAURI_INTERNALS__ = previous; });

  it("persists curve and applied selection in one write and copies the draft", async () => {
    const draft = [41, 56, 71];
    await service.saveCurve(1, draft, true);
    expect(ipc).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(ipc.calls.mostRecent().args[1].value);
    expect(saved.map((item: any) => item.selected)).toEqual([false, true]);
    expect(saved[1].array).toEqual(draft);
    draft[1] = 1;
    expect(service.getProfiles()[1].array).toEqual([41, 56, 71]);
  });

  it("keeps saved state intact on a failed write", async () => {
    ipc.and.rejectWith(new Error("disk failure"));
    await expectAsync(service.saveCurve(1, [99, 99, 99], true)).toBeRejected();
    expect(service.getProfiles()[0].selected).toBeTrue();
    expect(service.getProfiles()[1].array).toEqual([40, 55, 70]);
  });
  it("keeps memory unchanged when adding a profile cannot be saved", async () => {
    ipc.and.rejectWith("disk full");
    await expectAsync(service.addProfile("New")).toBeRejected();
    expect(service.getProfiles().map((item) => item.name)).toEqual(["Default", "Cooling"]);
  });
  it("serializes consecutive profile changes without losing either", async () => {
    await Promise.all([service.addProfile("One"), service.addProfile("Two")]);
    const saved = JSON.parse(ipc.calls.mostRecent().args[1].value);
    expect(saved.map((item: any) => item.name)).toEqual(["Default", "Cooling", "One", "Two"]);
    expect(new Set(saved.map((item: any) => item.id)).size).toBe(4);
  });
  it("rejects duplicate profile names and invalid deletion indices", async () => {
    await expectAsync(service.addProfile("cooling")).toBeRejected();
    await expectAsync(service.editProfileName(1, "Default")).toBeRejected();
    await expectAsync(service.deleteProfile(-1)).toBeRejected();
    expect(ipc).not.toHaveBeenCalled();
  });
  it("selects a remaining curve when the applied profile is deleted", async () => {
    await service.deleteProfile(0);
    expect(service.getProfiles()[0].name).toBe("Cooling"); expect(service.getProfiles()[0].selected).toBeTrue();
    await expectAsync(service.deleteProfile(0)).toBeRejected();
    expect(service.getProfiles().length).toBe(1);
  });
  it("does not poison later saves after an earlier write fails", async () => {
    ipc.and.rejectWith("disk full"); await expectAsync(service.addProfile("Failed")).toBeRejected();
    ipc.and.resolveTo(""); await service.addProfile("Working");
    expect(service.getProfiles().map((item) => item.name)).toEqual(["Default", "Cooling", "Working"]);
  });});
