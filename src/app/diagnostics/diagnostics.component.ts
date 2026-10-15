import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { ec } from "../services/device";

@Component({
  selector: "app-diagnostics", imports: [],
  templateUrl: "./diagnostics.component.html", styleUrl: "./diagnostics.component.scss",
})
export class DiagnosticsComponent implements OnInit, OnDestroy {
  readonly collected_info = signal("");
  readonly error = signal("");
  readonly loading = signal(false);
  readonly disabled = signal(true);
  readonly ectools = signal(true);
  selected_function = "Select";
  private revision = 0;
  private destroyed = false;
  async ngOnInit() {
    const [os, ecResult, cbmem] = await Promise.allSettled([
      invoke<string>("os"), ec(["hello"]),
      invoke<string>("execute_checked", { program: "cbmem", arguments: ["-v"] }),
    ]);
    if (this.destroyed) return;
    this.ectools.set(ecResult.status !== "fulfilled" || !/ec says hello!/i.test(ecResult.value));
    this.disabled.set(os.status !== "fulfilled" || os.value === "macOS" || cbmem.status !== "fulfilled");
    if (this.ectools() || this.disabled()) this.error.set("Some diagnostics are unavailable. Check the required tools and drivers.");
  }
  async select(value = this.selected_function) {
    this.selected_function = value;
    const revision = ++this.revision;
    this.collected_info.set(""); this.error.set("");
    if (value === "Select") { this.loading.set(false); return; }
    this.loading.set(true);
    try {
      const report = await invoke<string>("diagnostics", { selected: value });
      if (!this.destroyed && revision === this.revision) this.collected_info.set(report);
    } catch (error) {
      if (!this.destroyed && revision === this.revision) this.error.set("Unable to generate this report. Please retry.");
    } finally { if (!this.destroyed && revision === this.revision) this.loading.set(false); }
  }
  async copy_to_clipboard() {
    try { await invoke("copy", { text: this.collected_info() }); }
    catch (error) { if (!this.destroyed) this.error.set("Unable to copy the report."); }
  }
  async save() {
    if (!this.collected_info() || this.loading()) return;
    try { await invoke("save", { filename: this.selected_function, content: this.collected_info() }); }
    catch (error) { if (!this.destroyed) this.error.set("Unable to save the report."); }
  }
  ngOnDestroy() { this.destroyed = true; ++this.revision; }
}
