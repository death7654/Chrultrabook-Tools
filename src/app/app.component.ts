import { Component } from "@angular/core";

import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
    selector: "app-root",
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss"
})
export class AppComponent {}
