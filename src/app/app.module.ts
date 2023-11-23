import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { DashboardComponent } from './dashboard/dashboard.component';
import { FancontrolComponent } from './fancontrol/fancontrol.component';
import { SystemControlsComponent } from './system-controls/system-controls.component';
import { SystemInformationComponent } from './system-information/system-information.component';
import { SettingsComponent } from './settings/settings.component';
import { SidenavComponent } from "./sidenav/sidenav.component";

@NgModule({
  declarations: [AppComponent, SidenavComponent, DashboardComponent, FancontrolComponent, SystemControlsComponent, SystemInformationComponent, SettingsComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
