import { Injectable } from "@angular/core";
import { profile } from "./profiles";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { FanCurveResult } from "./fan-control";

@Injectable({
  providedIn: "root",
})
export class FanService {
  public profiles_list: profile[] = [];
  readonly ready = this.boot();
  constructor() { void this.ready.catch(() => {}); }

  private async boot(): Promise<void> {
    const res = await invoke<string>("get_fan_json");
    const profiles: profile[] = JSON.parse(res);
    if (!Array.isArray(profiles) || profiles.some((item) =>
      !item || typeof item.name !== "string" || !item.name.trim() ||
      !Number.isInteger(item.id) || !Array.isArray(item.array) || !item.array.length ||
      item.array.some((value) => !Number.isInteger(value) || value < 0 || value > 100))) {
      throw new Error("Invalid fan profiles");
    }
    let selected = false;
    this.profiles_list = profiles.map((item) => {
      const active = item.selected === true && !selected;
      selected ||= active;
      return { ...item, selected: active, disabled: true, class: "transparent", img_class: "btn-outline-info", img: "\uF4CB" };
    });
    if (!selected && this.profiles_list.length) this.profiles_list[0].selected = true;
  }
  getProfiles(): profile[] {
    return this.profiles_list;
  }

  getProfileArrayByName(name: string) {
    return this.profiles_list.find((profile) => profile.name === name);
  }

  getProfileByIndex(index: number) {
    return this.profiles_list[index];
  }

  getProfileIndexByName(name: string) {
    let objIndex = -1;
    for (let i = 0; i < this.profiles_list.length; i++) {
      if (this.profiles_list[i].name === name) {
        objIndex = i;
        return objIndex;
        break;
      }
    }
    return -1;
  }

  private pending: Promise<void> = Promise.resolve();
  private commit(change: (profiles: profile[]) => void): Promise<void> {
    const operation = this.pending.catch(() => {}).then(async () => {
      await this.ready;
      const next = this.profiles_list.map((item) => ({ ...item, array: [...item.array] }));
      change(next);
      await invoke("local_storage", { function: "save", option: "profiles", value: JSON.stringify(next) });
      this.profiles_list.splice(0, this.profiles_list.length, ...next);
    });
    this.pending = operation;
    return operation;
  }
  private checkName(profiles: profile[], name: string, except = -1) {
    if (!name.trim() || profiles.some((item, i) => i !== except && item.name.toLowerCase() === name.trim().toLowerCase())) {
      throw new Error("Use a nonempty, unique profile name.");
    }
  }
  addProfile(name: string) {
    return this.commit((profiles) => {
      this.checkName(profiles, name);
      profiles.push({ id: Math.max(-1, ...profiles.map((item) => item.id)) + 1,
        name: name.trim(), array: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100, 100],
        selected: profiles.length === 0, disabled: true, class: "transparent",
        img_class: "btn-outline-info", img: "\uF4CB" });
    });
  }
  editProfileName(index: number, name: string) {
    return this.commit((profiles) => {
      if (!profiles[index]) throw new Error("Profile no longer exists.");
      this.checkName(profiles, name, index); profiles[index].name = name.trim();
    });
  }
  getSelected() {
    for (let i = 0; i < this.profiles_list.length; i++) {
      if (this.profiles_list[i].selected === true) {
        return [this.profiles_list[i].name, this.profiles_list[i].array];
      }
    }
    return " ";
  }

  /** Persist curve and selection together, then update the editor's saved state. */
  async saveCurve(index: number, array: number[], apply: boolean): Promise<void> {
    const draft = [...array];
    if (!draft.length || draft.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) throw new Error("Invalid curve");
    await this.commit((profiles) => {
      if (!profiles[index]) throw new Error("Select a fan profile before saving");
      profiles.forEach((item, i) => {
        if (i === index) item.array = [...draft];
        if (apply) item.selected = i === index;
      });
    });
  }
  async applyCurve(name: string, array: number[]): Promise<void> {
    const requestId = crypto.randomUUID();
    let resolveResult!: (result: FanCurveResult) => void;
    const result = new Promise<FanCurveResult>((resolve) => { resolveResult = resolve; });
    const unlisten = await getCurrentWebviewWindow().listen<FanCurveResult>(
      "fan_curve_applied", (event) => {
        if (event.payload.requestId === requestId) resolveResult(event.payload);
      },
    );
    const timeout = setTimeout(() => resolveResult({ requestId, applied: false }), 8000);
    try {
      await invoke("transfer_fan_curves", { curves: { requestId, name, array: [...array] } });
      if (!(await result).applied) throw new Error("Main window did not apply the fan curve");
    } finally {
      clearTimeout(timeout);
      unlisten();
    }
  }

  deleteProfile(index: number) {
    return this.commit((profiles) => {
      if (!profiles[index]) throw new Error("Profile no longer exists.");
      if (profiles.length === 1) throw new Error("Keep at least one fan profile.");
      const selected = profiles[index].selected;
      profiles.splice(index, 1);
      if (selected) profiles[0].selected = true;
    });
  }
}
