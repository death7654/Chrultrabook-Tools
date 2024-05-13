import { Routes } from "@angular/router";
import { CustomFanComponent } from "./custom-fan/custom-fan.component";
import { HomeComponent } from "./home/home.component";

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'custom_fan', component: CustomFanComponent}
];
