import { ApplicationConfig } from "@angular/core";
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
