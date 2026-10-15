import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from "@angular/core";
import { FanService } from "../../services/fan.service";
import { profile } from "../../services/profiles";

@Component({
  selector: "app-fan-profiles", imports: [],
  templateUrl: "./fan-profiles.component.html", styleUrl: "./fan-profiles.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FanProfilesComponent implements OnDestroy {
  profiles: profile[] = [];
  fan_service = inject(FanService);
  busy = true;
  error = "";
  private destroyed = false;
  constructor(private cdr: ChangeDetectorRef) {
    this.fan_service.ready.then(() => {
      if (!this.destroyed) this.profiles = this.fan_service.getProfiles();
    }).catch(() => this.error = "Unable to load fan profiles.")
      .finally(() => { this.busy = false; if (!this.destroyed) this.cdr.markForCheck(); });
  }
  private async update(action: () => Promise<void>) {
    if (this.busy) return;
    this.busy = true; this.error = "";
    try { await action(); }
    catch (error) { if (!this.destroyed) this.error = String(error); }
    finally { this.busy = false; if (!this.destroyed) this.cdr.markForCheck(); }
  }
  addProfiles(input: HTMLInputElement) {
    const name = input.value.trim();
    if (!name) return;
    return this.update(async () => { await this.fan_service.addProfile(name); input.value = ""; });
  }
  async editProfile(index: number, input: HTMLInputElement) {
    if (this.busy) return;
    const item = this.profiles[index];
    if (item.disabled) {
      item.class = "edit"; item.img = "\uF7D8"; item.img_class = "btn-outline-success"; item.disabled = false;
      input.value = item.name;
    } else {
      await this.update(async () => {
        await this.fan_service.editProfileName(index, input.value);
        const saved = this.profiles[index];
        saved.class = "transparent"; saved.img = "\uF4CB"; saved.img_class = "btn-outline-info"; saved.disabled = true;
      });
    }
  }
  deleteProfiles(index: number) { return this.update(() => this.fan_service.deleteProfile(index)); }
  ngOnDestroy() { this.destroyed = true; }
}
