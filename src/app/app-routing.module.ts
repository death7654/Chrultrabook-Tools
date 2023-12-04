import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from "./dashboard/dashboard.component";
import { FanControlsComponent } from "./fan-controls/fan-controls.component";
import { SystemControlsComponent } from "./system-controls/system-controls.component";
import { SystemInfoComponent } from "./system-info/system-info.component";
import { SettingsComponent } from "./settings/settings.component";

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'fan_controls', component: FanControlsComponent},
  { path: 'system_controls', component: SystemControlsComponent},
  { path: 'system_info', component: SystemInfoComponent},
  { path: 'settings', component: SettingsComponent},
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }