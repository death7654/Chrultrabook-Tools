import { Routes } from "@angular/router";
import { CustomFanComponent } from "./custom-fan/custom-fan.component";
import { HomeComponent } from "./home/home.component";
import { KeyboardExtraComponent } from "./keyboard-extra/keyboard-extra.component";
import { DiagnosticsComponent } from "./diagnostics/diagnostics.component";
import { SettingsComponent } from "./settings/settings.component";

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'custom_fan', component: CustomFanComponent},
    {path: 'keyboard_extra', component: KeyboardExtraComponent},
    {path: 'diagnostics', component: DiagnosticsComponent},
    {path: 'settings', component: SettingsComponent}
];
