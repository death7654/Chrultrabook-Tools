import { Component, OnDestroy, signal } from "@angular/core";
import { ChangeDetectorRef } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { FormsModule } from '@angular/forms';

interface RemapConfigKey {
  make_code: number;
  make_code_hex: string;
  flags: number;
  flags_decoded?: string[];
}

interface RemapConfig {
  index: number;
  left_ctrl: string;
  left_alt: string;
  search: string;
  assistant: string;
  left_shift: string;
  right_ctrl: string;
  right_alt: string;
  right_shift: string;
  original_key: RemapConfigKey;
  remap_vivaldi_to_fn: boolean;
  remapped_key?: RemapConfigKey | null;
  additional_keys?: RemapConfigKey[];
}

interface ConfigFileJson {
  magic: string;
  magic_hex: string;
  valid: boolean;
  remappings: number;
  flip_search_and_assistant_on_pixelbook: boolean;
  has_assistant_key: string;
  is_non_chrome_ec: string;
  file_size_bytes: number;
  expected_size_bytes: number;
  configs: RemapConfig[];
}

@Component({
  selector: "app-keyboard-remap",
  imports: [FormsModule],
  templateUrl: "./keyboard-remap.component.html",
  styleUrl: "./keyboard-remap.component.scss",
})
export class KeyboardRemapComponent implements OnDestroy {
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal("");
  readonly status = signal("");
  private destroyed = false;
  private revision = 0;
  constructor(private cdr: ChangeDetectorRef) {}

  // Remap mode
  remapMode: boolean = false;
  current_remap: RemapConfig[] = [];
  fullConfig: ConfigFileJson | null = null;
  linux: boolean = true;

  // Table view state
  showTableView: boolean = true;
  editingCell: { rowIndex: number; field: string } | null = null;

  // Valid options from Rust code
  keyStateOptions = ["NoDetect", "Enforce", "EnforceNot"];
  modifierFields = [
    "left_ctrl",
    "left_alt",
    "search",
    "assistant",
    "left_shift",
    "right_ctrl",
    "right_alt",
    "right_shift",
  ];

  ngOnInit() {
    invoke("os").then((os) => {
      if (this.destroyed) return;
      if (typeof os == "string") {
        if (os === "not macOS") {
          this.linux = false;
          this.cdr.detectChanges();
          this.getRemappedKeys(false);
        } else this.loading.set(false);
      }
    }).catch(() => { if (!this.destroyed) { this.error.set("Unable to detect operating system."); this.loading.set(false); } });
  }

  getRemappedKeys(type: boolean) {
    if (this.current_remap.length > 0) return this.current_remap;
    const revision = ++this.revision;
    this.loading.set(true); this.error.set("");
    if (this.current_remap.length === 0) {
      // Only fetch if not already loaded
      invoke<string>("get_remap_json", { hardReset: type })
        .then((event) => {
          if (this.destroyed || revision !== this.revision) return;
          if (typeof event === "string") {
            const parsedConfig: ConfigFileJson = JSON.parse(event);
            if (!parsedConfig.valid || !Array.isArray(parsedConfig.configs)) throw new Error("Invalid keyboard configuration");
            this.fullConfig = parsedConfig;
            this.current_remap = parsedConfig.configs;
            console.log("Loaded config:", this.current_remap);
            this.cdr.detectChanges();
          }
        })
        .catch((error) => {
          console.error("Failed to load config:", error);
          if (!this.destroyed && revision === this.revision) this.error.set("Unable to load keyboard configuration or backup.");
        }).finally(() => { if (!this.destroyed && revision === this.revision) this.loading.set(false); });
    }
    return this.current_remap;
  }
  // Table editing methods
  startEditCell(rowIndex: number, field: string): void {
    this.editingCell = { rowIndex, field };
  }

  cancelEditCell(): void {
    this.editingCell = null;
  }

  isEditingCell(rowIndex: number, field: string): boolean {
    return (
      this.editingCell?.rowIndex === rowIndex &&
      this.editingCell?.field === field
    );
  }

updateConfigField(rowIndex: number, field: string, value: any): void {
  if (rowIndex < this.current_remap.length) {
    const record = this.current_remap[rowIndex];

    if (field === "remap_vivaldi_to_fn") {
      record.remap_vivaldi_to_fn = String(value) === 'true';
    } else {
      (record as any)[field] = String(value);
    }

    this.editingCell = null;
    this.cdr.detectChanges();
  }
}

  resetToCurrentConfig(): void {
    if (confirm("Reset all keys to previous save state?")) {
      this.fullConfig = null;
      this.current_remap = [];
      this.getRemappedKeys(false);
      this.cdr.detectChanges();
    }
  }

  resetToOriginalConfig(): void {
    if (confirm("Reset all keys to original remap state?")) {
      this.fullConfig = null;
      this.current_remap = [];
      this.getRemappedKeys(true);
      this.cdr.detectChanges();
    }
  }

  async exportConfigJSON(): Promise<void> {
    if (!this.fullConfig || this.loading() || this.saving()) {
      console.error("No config loaded");
      return;
    }

    const updatedConfig: ConfigFileJson = {
      ...this.fullConfig,
      remappings: this.current_remap.length,
      configs: this.current_remap,
    };

    const jsonString = JSON.stringify(updatedConfig);

    console.log("Exporting config with", this.current_remap.length, "entries");

    this.saving.set(true); this.error.set(""); this.status.set("");
    try {
      const applied = await invoke<boolean>("set_remap", { params: jsonString });
      if (!this.destroyed) this.status.set(applied ? "Keyboard configuration saved and reloaded." : "Save cancelled.");
    } catch (error) {
      if (!this.destroyed) this.error.set("Unable to save or reload keyboard mapping. Check driver access.");
    } finally { if (!this.destroyed) this.saving.set(false); }
  }

  getCellClass(value: any): any {
    if (value === "NoDetect") return "text-white";
    if (value === "Enforce") return "text-success fw-semibold";
    if (value === "EnforceNot") return "text-danger fw-semibold";
    return "text-white fw-bold";
  }
  ngOnDestroy() { this.destroyed = true; ++this.revision; }
}
