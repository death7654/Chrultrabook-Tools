import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

//prevent right clicks
document.addEventListener("contextmenu", (event) => event.preventDefault());

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

