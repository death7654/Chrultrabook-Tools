import { Component, OnDestroy, ChangeDetectorRef, signal } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ec } from "../../services/device";

const ANIMATION_INTERVAL = 50;

interface Key {
  label: string;
  state: string;
  width?: number;
}

interface CustomColor {
  id: number;
  hexCode: string;
  duration: number;
}

interface SavedStep {
  id: number;
  hex_code: string;
  duration_ms: number;
}

interface SavedProfile {
  id: number;
  name: string;
  mode: string;
  steps_count: number;
  steps: SavedStep[];
}

@Component({
  selector: "app-rgb-keyboard",
  imports: [CommonModule, FormsModule],
  templateUrl: "./rgb-keyboard.component.html",
  styleUrl: "./rgb-keyboard.component.scss",
})
export class RgbKeyboardComponent implements OnDestroy {
  readonly error = signal("");
  readonly busy = signal(false);
  private destroyed = false;
  private _rgbEnabled: boolean = true;
  brightness: number = 80;
  private _rgbRed: number = 255;
  private _rgbGreen: number = 100;
  private _rgbBlue: number = 255;
  private _hexCodeInput: string = "FF64FF";
  private _rgbMode: string = "off";
  default_button_state: string = "btn-outline-secondary";
  selectedKeyIndex: { row: number; col: number } | null = null;
  customCycleName: string = "My Custom Cycle";

  options_enabled: boolean = true;

  generatedConfigJson: string = "";

  selectedProfileId: number | string = "off";
  customProfiles: SavedProfile[] = [];

  private colorCycleInterval: any;
  private currentColorIndex: number = 0;
  private currentStepStartTime: number = 0;
  private currentStartRgb: { r: number; g: number; b: number } = {
    r: 0,
    g: 0,
    b: 0,
  };

  customColors: CustomColor[] = [
    { id: 1, hexCode: "#FF0000", duration: 1000 },
    { id: 2, hexCode: "#00FF00", duration: 1500 },
    { id: 3, hexCode: "#0000FF", duration: 800 },
  ];
  private nextCustomColorId: number = 4;

  keyboardLayout: Key[][] = [
    [
      { label: "esc", state: this.default_button_state, width: 1 },
      { label: "\uF12F", state: this.default_button_state, width: 1 },
      { label: "\uF138", state: this.default_button_state, width: 1 },
      { label: "\uF116", state: this.default_button_state, width: 1 },
      { label: "\uF14D", state: this.default_button_state, width: 1 },
      { label: "\uF6CF", state: this.default_button_state, width: 1 },
      { label: "\uF1D4", state: this.default_button_state, width: 1 },
      { label: "\uF1D2", state: this.default_button_state, width: 1 },
      { label: "\uF60D", state: this.default_button_state, width: 1 },
      { label: "\uF60B", state: this.default_button_state, width: 1 },
      { label: "\uF611", state: this.default_button_state, width: 1 },
      { label: "\uF47B", state: this.default_button_state, width: 1 },
    ],
    [
      { label: "`", state: this.default_button_state, width: 1 },
      { label: "1", state: this.default_button_state, width: 1 },
      { label: "2", state: this.default_button_state, width: 1 },
      { label: "3", state: this.default_button_state, width: 1 },
      { label: "4", state: this.default_button_state, width: 1 },
      { label: "5", state: this.default_button_state, width: 1 },
      { label: "6", state: this.default_button_state, width: 1 },
      { label: "7", state: this.default_button_state, width: 1 },
      { label: "8", state: this.default_button_state, width: 1 },
      { label: "9", state: this.default_button_state, width: 1 },
      { label: "0", state: this.default_button_state, width: 1 },
      { label: "-", state: this.default_button_state, width: 1 },
      { label: "=", state: this.default_button_state, width: 1 },
      { label: "backspace", state: this.default_button_state, width: 2 },
    ],
    [
      { label: "tab", state: this.default_button_state, width: 1.5 },
      { label: "Q", state: this.default_button_state, width: 1 },
      { label: "W", state: this.default_button_state, width: 1 },
      { label: "E", state: this.default_button_state, width: 1 },
      { label: "R", state: this.default_button_state, width: 1 },
      { label: "T", state: this.default_button_state, width: 1 },
      { label: "Y", state: this.default_button_state, width: 1 },
      { label: "U", state: this.default_button_state, width: 1 },
      { label: "I", state: this.default_button_state, width: 1 },
      { label: "O", state: this.default_button_state, width: 1 },
      { label: "P", state: this.default_button_state, width: 1 },
      { label: "[", state: this.default_button_state, width: 1 },
      { label: "]", state: this.default_button_state, width: 1 },
      { label: "\\", state: this.default_button_state, width: 1.5 },
    ],
    [
      { label: "\uF52A", state: this.default_button_state, width: 1.75 },
      { label: "A", state: this.default_button_state, width: 1 },
      { label: "S", state: this.default_button_state, width: 1 },
      { label: "D", state: this.default_button_state, width: 1 },
      { label: "F", state: this.default_button_state, width: 1 },
      { label: "G", state: this.default_button_state, width: 1 },
      { label: "H", state: this.default_button_state, width: 1 },
      { label: "J", state: this.default_button_state, width: 1 },
      { label: "K", state: this.default_button_state, width: 1 },
      { label: "L", state: this.default_button_state, width: 1 },
      { label: ";", state: this.default_button_state, width: 1 },
      { label: "'", state: this.default_button_state, width: 1 },
      { label: "Enter", state: this.default_button_state, width: 2.25 },
    ],
    [
      { label: "Shift", state: this.default_button_state, width: 2.25 },
      { label: "Z", state: this.default_button_state, width: 1 },
      { label: "X", state: this.default_button_state, width: 1 },
      { label: "C", state: this.default_button_state, width: 1 },
      { label: "V", state: this.default_button_state, width: 1 },
      { label: "B", state: this.default_button_state, width: 1 },
      { label: "N", state: this.default_button_state, width: 1 },
      { label: "M", state: this.default_button_state, width: 1 },
      { label: ",", state: this.default_button_state, width: 1 },
      { label: ".", state: this.default_button_state, width: 1 },
      { label: "/", state: this.default_button_state, width: 1 },
      { label: "Shift", state: this.default_button_state, width: 2.75 },
    ],
    [
      { label: "Ctrl", state: this.default_button_state, width: 1.25 },
      { label: "Alt", state: this.default_button_state, width: 1.25 },
      { label: "Space", state: this.default_button_state, width: 6.25 },
      { label: "Alt", state: this.default_button_state, width: 1.25 },
      { label: "Ctrl", state: this.default_button_state, width: 1.25 },
    ],
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  private loadProfileData(profileId: number): void {
    const profile = this.customProfiles.find((p) => p.id === profileId);

    if (profile) {
      this.customCycleName = profile.name;

      this.customColors = profile.steps.map((step: any, index: number) => ({
        id: index,
        hexCode: step.hex_code.startsWith("#")
          ? step.hex_code.toUpperCase()
          : `#${step.hex_code.toUpperCase()}`,
        duration: step.duration_ms,
      }));

      this.nextCustomColorId =
        this.customColors.length > 0
          ? this.customColors[this.customColors.length - 1].id + 1
          : 1;

      console.log(`Loaded data for profile: ${profile.name}`);

      this.startColorCycle();
    } else {
      console.error(
        `Profile with ID ${profileId} not found in customProfiles.`
      );
    }
  }

  ngOnInit() {
    this.loadCustomProfiles();
    this.rgbEnabled = false;
  }
  private loadCustomProfiles(): void {
    const STORAGE_KEY = "rgb_profile";
    let configList: any[] = [];

    invoke("local_storage", {
      function: "get",
      option: STORAGE_KEY,
      value: "",
    })
      .then((existingJsonString: any) => {
        if (typeof existingJsonString === "string" && existingJsonString) {
          try {
            configList = JSON.parse(existingJsonString);
          } catch (e) {
            console.error("Error parsing existing RGB config JSON:", e);
            configList = [];
          }
        }
        if (this.destroyed) return;
        if (!Array.isArray(configList)) throw new Error("Invalid RGB profiles");
        this.customProfiles = configList;
        console.log("Loaded profiles:", this.customProfiles);
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error("Failed to load custom profiles:", error);
      });
  }

  get rgbEnabled(): boolean {
    return this._rgbEnabled;
  }
  set rgbEnabled(value: boolean) {
    this._rgbEnabled = value;
    if (this._rgbEnabled && this.rgbMode === "custom") {
      this.startColorCycle();
    } else {
      this.stopColorCycle();
    }
  }

  get rgbMode(): string {
    return this._rgbMode;
  }
  set rgbMode(value: string) {
    this.options_enabled = true;
    this._rgbMode = value;
    this.stopColorCycle();
    this._rgbEnabled = true;

    const profileId = parseInt(value, 10);

    if (!isNaN(profileId)) {
      this.selectedProfileId = profileId;
      this.loadProfileData(profileId);
      this._rgbMode = "custom";

      return;
    }

    if (this._rgbMode === "custom") {
      this.rgbEnabled = true;
      this.options_enabled = true;
    }

    if (this._rgbMode === "off") {
      this.rgbEnabled = false;
      this.options_enabled = true;
    }

    if (this._rgbMode == "flow") {
      this.rgbEnabled = true;
      this.options_enabled = false;
    }

    if (this._rgbMode == "dot") {
      this.rgbEnabled = true;
      this.options_enabled = false;
    }
  }

  get rgbColor(): string {
    return `rgb(${Math.round(this.rgbRed)}, ${Math.round(
      this.rgbGreen
    )}, ${Math.round(this.rgbBlue)})`;
  }

  get rgbOpacity(): number {
    return this.brightness / 100;
  }

  get rgbRed(): number {
    return this._rgbRed;
  }
  set rgbRed(value: number) {
    this._rgbRed = Math.max(0, Math.min(255, value));
    this.updateHexFromRgb();
  }

  get rgbGreen(): number {
    return this._rgbGreen;
  }
  set rgbGreen(value: number) {
    this._rgbGreen = Math.max(0, Math.min(255, value));
    this.updateHexFromRgb();
  }

  get rgbBlue(): number {
    return this._rgbBlue;
  }
  set rgbBlue(value: number) {
    this._rgbBlue = Math.max(0, Math.min(255, value));
    this.updateHexFromRgb();
  }

  get hexCodeInput(): string {
    return this._hexCodeInput;
  }
  set hexCodeInput(value: string) {
    this._hexCodeInput = value;
    this.updateRgbFromHex();
  }

  private _updateRgbFromHex(
    hex: string
  ): { r: number; g: number; b: number } | null {
    let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
    if (cleanHex.length === 6) {
      try {
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          return {
            r: Math.max(0, Math.min(255, r)),
            g: Math.max(0, Math.min(255, g)),
            b: Math.max(0, Math.min(255, b)),
          };
        }
      } catch (e) {}
    }
    return null;
  }

  private updateHexFromRgb(): void {
    const r = Math.round(this.rgbRed).toString(16).padStart(2, "0");
    const g = Math.round(this.rgbGreen).toString(16).padStart(2, "0");
    const b = Math.round(this.rgbBlue).toString(16).padStart(2, "0");
    this._hexCodeInput = `#${r}${g}${b}`.toUpperCase();
  }

  private updateRgbFromHex(): void {
    const rgb = this._updateRgbFromHex(this._hexCodeInput);
    if (rgb) {
      this._rgbRed = rgb.r;
      this._rgbGreen = rgb.g;
      this._rgbBlue = rgb.b;
    }
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
    this.stopColorCycle();
  }

  public async generateCustomRgbConfigJson(send_to_main: boolean): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true); this.error.set("");
    try {
      const raw = await invoke<string>("local_storage", { function: "get", option: "rgb_profile", value: "" });
      const profiles = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(profiles)) throw new Error("Invalid RGB profiles");
      const name = this.customCycleName.trim();
      if (!name || !this.customColors.length || this.customColors.some((color) =>
        !/^#?[a-f0-9]{6}$/i.test(color.hexCode) || !Number.isFinite(color.duration) || color.duration < 1)) throw new Error("Invalid RGB cycle");
      const previous = profiles.find((profile) => profile.name === name);
      const id = previous?.id ?? Math.max(0, ...profiles.map((profile) => profile.id)) + 1;
      const next = profiles.filter((profile) => profile.id !== id).map((profile) => ({ ...profile, active: send_to_main ? false : profile.active }));
      next.push({ id, active: send_to_main || !!previous?.active, name, mode: "custom_cycle", steps_count: this.customColors.length,
        steps: this.customColors.map((color) => ({ hex_code: "#" + color.hexCode.replace(/^#/, "").toUpperCase(), duration_ms: color.duration })) });
      const json = JSON.stringify(next);
      await invoke("local_storage", { function: "save", option: "rgb_profile", value: json });
      if (!this.destroyed) { this.customProfiles = next; this.generatedConfigJson = json; }
      // Custom cycles remain a preview until a persistent hardware controller is implemented.
      if (send_to_main && !this.destroyed) this.error.set("Cycle saved. Custom cycles currently support preview only.");
    } catch (error) { if (!this.destroyed) this.error.set("Unable to save RGB profile. Check its name, colors and durations."); }
    finally { if (!this.destroyed) this.busy.set(false); }
  }
  public async delete_profile(profileId: number | string): Promise<void> {
    if (typeof profileId !== "number" || this.busy()) return;
    this.busy.set(true); this.error.set("");
    try {
      const raw = await invoke<string>("local_storage", { function: "get", option: "rgb_profile", value: "" });
      const profiles = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(profiles)) throw new Error("Invalid RGB profiles");
      const next = profiles.filter((profile) => profile.id !== profileId);
      await invoke("local_storage", { function: "save", option: "rgb_profile", value: JSON.stringify(next) });
      if (!this.destroyed) { this.customProfiles = next; this.rgbMode = "off"; this.selectedProfileId = "off"; }
    } catch (error) { if (!this.destroyed) this.error.set("Unable to delete RGB profile."); }
    finally { if (!this.destroyed) this.busy.set(false); }
  }
  public startColorCycle(): void {
    this.stopColorCycle();

    if (
      this.customColors.length < 1 ||
      !this.rgbEnabled ||
      this.rgbMode !== "custom"
    ) {
      return;
    }

    this.currentColorIndex = 0;

    // Initialize the first displayed color and the transition start color
    const initialRgb = this._updateRgbFromHex(this.customColors[0].hexCode);
    if (initialRgb) {
      this.currentStartRgb = initialRgb;
      this._rgbRed = initialRgb.r;
      this._rgbGreen = initialRgb.g;
      this._rgbBlue = initialRgb.b;
    }

    // Start the timer for the first transition
    this.currentStepStartTime = Date.now();

    this.colorCycleInterval = setInterval(
      () => this.updateColorTransition(),
      ANIMATION_INTERVAL
    );
  }

  private updateColorTransition(): void {
    if (
      this.customColors.length < 1 ||
      !this.rgbEnabled ||
      this.rgbMode !== "custom"
    ) {
      this.stopColorCycle();
      return;
    }

    const now = Date.now();

    // The transition is from the color in this.currentColorIndex TO the color in targetIndex
    const previousIndex = this.currentColorIndex;
    const targetIndex = (this.currentColorIndex + 1) % this.customColors.length;

    const currentConfig = this.customColors[previousIndex];
    const nextConfig = this.customColors[targetIndex];

    const duration = Math.max(1, currentConfig.duration);
    const elapsed = now - this.currentStepStartTime;
    const progress = Math.min(1, elapsed / duration);

    // START color is read from the explicitly saved state for this transition step
    const startR = this.currentStartRgb.r;
    const startG = this.currentStartRgb.g;
    const startB = this.currentStartRgb.b;

    // TARGET color is the color we are fading to (from the next config entry)
    const targetRgb = this._updateRgbFromHex(nextConfig.hexCode);

    if (!targetRgb) {
      this.stopColorCycle();
      return;
    }

    if (progress < 1) {
      // Interpolate smoothly
      this._rgbRed = startR + (targetRgb.r - startR) * progress;
      this._rgbGreen = startG + (targetRgb.g - startG) * progress;
      this._rgbBlue = startB + (targetRgb.b - startB) * progress;
    } else {
      // Transition complete: Set final color exactly
      this._rgbRed = targetRgb.r;
      this._rgbGreen = targetRgb.g;
      this._rgbBlue = targetRgb.b;

      // Set the START color for the next transition step to be this exact final color
      this.currentStartRgb = { r: targetRgb.r, g: targetRgb.g, b: targetRgb.b };

      // Move to the next index and reset the timer
      this.currentColorIndex = targetIndex;
      this.currentStepStartTime = now;
    }

    this.cdr.detectChanges();
  }

  public stopColorCycle(): void {
    if (this.colorCycleInterval) {
      clearInterval(this.colorCycleInterval);
      this.colorCycleInterval = null;
      this.currentStepStartTime = 0;
    }
  }

  public addCustomColor(): void {
    this.customColors.push({
      id: this.nextCustomColorId++,
      hexCode: "#FFFFFF",
      duration: 1000,
    });
    if (this.rgbMode === "custom" && this.rgbEnabled) {
      this.startColorCycle();
    }
  }

  public removeCustomColor(id: number): void {
    if (this.customColors.length > 1) {
      this.customColors = this.customColors.filter((color) => color.id !== id);

      if (this.rgbMode === "custom" && this.rgbEnabled) {
        this.startColorCycle();
      }
    }
  }

  public async apply(): Promise<void> {
    if (this.busy()) return;
    const mode = this._rgbMode;
    const hex = this.hexCodeInput.trim().replace(/^#/, "");
    if (mode === "static" && !/^[a-f0-9]{6}$/i.test(hex)) { this.error.set("Enter a six-digit hex color."); return; }
    if (!["off", "static", "flow", "dot"].includes(mode)) return;
    this.busy.set(true); this.error.set("");
    try {
      if (mode === "static" || mode === "off") {
        await ec(["rgbkbd", "demo", "0"]);
        await ec(["rgbkbd", "clear", mode === "off" ? "0x000000" : "0x" + hex.toLowerCase()]);
      } else await ec(["rgbkbd", "demo", mode === "flow" ? "1" : "2"]);
      if (mode !== "off") await ec(["pwmsetkblight", Math.round(Math.max(0, Math.min(100, this.brightness)))]);
    } catch (error) { if (!this.destroyed) this.error.set("Unable to apply RGB lighting. Check keyboard and firmware support."); }
    finally { if (!this.destroyed) this.busy.set(false); }
  }
  get isCustomMode(): boolean {
    return (
      this.rgbMode != "off" &&
      this.rgbMode != "static" &&
      this.rgbMode != "flow" &&
      this.rgbMode != "dot"
    );
  }
}
