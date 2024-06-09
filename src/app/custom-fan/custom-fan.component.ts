import { Component, ViewChild } from "@angular/core";
import { FanSectionComponent } from "../home/fan-section/fan-section.component";
import { ChartConfiguration, Plugin, Chart } from "chart.js/auto";
import { BaseChartDirective } from "ng2-charts";
import { ButtonComponent } from "../button/button.component";
import { default as dragData } from "chartjs-plugin-dragdata";

@Component({
  selector: "app-custom-fan",
  standalone: true,
  imports: [ButtonComponent, FanSectionComponent, BaseChartDirective],
  templateUrl: "./custom-fan.component.html",
  styleUrl: "./custom-fan.component.scss",
})
export class CustomFanComponent {

  public lineChartData: ChartConfiguration["data"] = {
    
    datasets: [
      {
        data: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100],
        label: "Fan Speed In Percentage",
        backgroundColor: "rgba(232,72,85,0.2)",
        borderColor: "#FF6694",
        pointBackgroundColor: "#FF6694",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(148,159,177,0.8)",
        fill: "origin",
      },
    ],
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
  };

  public lineChartOptions: ChartConfiguration["options"] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      y: {
        position: "left",
        grid: {
          color: "#c0c0c0",
        },
      },
      x: {
        grid: {
          color: "#c0c0c0",
        },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };
  dragData = dragData
}
