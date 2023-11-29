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
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AppRoutingModule } from "./app-routing.module";

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
  imports: [BrowserModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
