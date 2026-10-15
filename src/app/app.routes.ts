import { Routes } from "@angular/router";

import { CustomFanComponent } from "./custom-fan/custom-fan.component";
import { FanCurvesComponent } from "./custom-fan/fan-curves/fan-curves.component";
import { FanProfilesComponent } from "./custom-fan/fan-profiles/fan-profiles.component";
import { FanDataComponent } from "./custom-fan/fan-data/fan-data.component";

import { HomeComponent } from "./home/home.component";
import { DiagnosticsComponent } from "./diagnostics/diagnostics.component";
import { SettingsComponent } from "./settings/settings.component";

import { KeyboardExtraComponent } from "./keyboard-extra/keyboard-extra.component";
import { RgbKeyboardComponent } from "./keyboard-extra/rgb-keyboard/rgb-keyboard.component";
import { KeyboardRemapComponent } from "./keyboard-extra/keyboard-remap/keyboard-remap.component";
import { BatteryComponent } from "./battery/battery.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "Custom_Fans",
    component: CustomFanComponent,
    children: [
      {
        path: "",
        redirectTo: "fan_curves",
        pathMatch: "full",
      },
      {
        path: "fan_curves",
        component: FanCurvesComponent,
      },
      {
        path: "fan_profiles",
        component: FanProfilesComponent,
      },
      {
        path: "fan_data",
        component: FanDataComponent,
      },
    ],
  },
  {
    path: "Battery",
    component: BatteryComponent,
  },
  {
    path: "Keyboard_extra",
    component: KeyboardExtraComponent,
    children: [
      {
        path: "",
        redirectTo: "remap",
        pathMatch: "full",
      },
      {
        path: "remap",
        component: KeyboardRemapComponent,
      },
      {
        path: "rgb",
        component: RgbKeyboardComponent,
      },
    ],
  },
  { path: "Diagnostics", component: DiagnosticsComponent },
  { path: "Settings", component: SettingsComponent },
];
