import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { FanControlsComponent } from "./fan-controls/fan-controls.component";
import { SystemControlsComponent } from "./system-controls/system-controls.component";
import { SystemInfoComponent } from "./system-info/system-info.component";
import { SettingsComponent } from "./settings/settings.component";
import { SideNavComponent } from "./side-nav/side-nav.component";

import { RouterModule } from '@angular/router';
import { AppRoutingModule } from "./app-routing.module";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FanControlsComponent,
    SystemControlsComponent,
    SystemInfoComponent,
    SettingsComponent,
    SideNavComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    MatSidenavModule,
    MatListModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
