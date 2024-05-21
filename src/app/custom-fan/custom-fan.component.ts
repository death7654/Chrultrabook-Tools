import { Component } from "@angular/core";
import { Chart, Colors } from "chart.js/auto";
import { ButtonComponent } from "../button/button.component";

//import * as dragData from 'chartjs-plugin-dragdata';

@Component({
  selector: "app-custom-fan",
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: "./custom-fan.component.html",
  styleUrl: "./custom-fan.component.scss",
})
export class CustomFanComponent {
  title = "ng-chart";
  chart: any = [];

  constructor() {}

  ngOnInit() {
    this.chart = new Chart("canvas", {
      type: "line",
      data: {
        labels: [
          "40°C",
          "45°C",
          "50°C",
          "55°C",
          "60°C",
          "65°C",
          "70°C",
          "75°C",
          "80°C",
        ],
        datasets: [
          {
            label: "Fan Speed in Percentage",
            data: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100],
            borderWidth: 1,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#FF6694",
            pointHoverBackgroundColor: "#fff",
            backgroundColor: "#F9C80E",
            borderColor: "#FF6694",
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "#adadad",
            },
            ticks: {
              color: "#adadad",
            },
          },
          x: {
            grid: {
              color: "#adadad",
            },
            ticks: {
              color: "#adadad",
            },
          },
        },
        plugins: {},
      },
    });
  }
}
