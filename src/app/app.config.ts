import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideCharts } from "ng2-charts";
import {
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";
import { default as dragData } from "chartjs-plugin-dragdata";

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js is loaded in angular.json; legacy screens mutate ordinary fields
    // after Tauri promises, so explicitly retain their change detection contract.
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts({
      registerables: [
        LineController,
        LineElement,
        LinearScale,
        CategoryScale,
        PointElement,
        Tooltip,
        Filler,
        dragData,
      ],
    }),
  ],
};
