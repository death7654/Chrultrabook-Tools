import { Component, ViewChild, inject } from "@angular/core";
import { FanSectionComponent } from "../home/fan-section/fan-section.component";
import { FanService } from "../services/fan.service";
import { ButtonComponent } from "../button/button.component";
import { invoke } from "@tauri-apps/api/core";


import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, Plugin, Chart } from "chart.js/auto";
import { default as dragData } from "chartjs-plugin-dragdata";

@Component({
  selector: "app-custom-fan",
  standalone: true,
  imports: [ButtonComponent, FanSectionComponent, BaseChartDirective],
  templateUrl: "./custom-fan.component.html",
  styleUrl: "./custom-fan.component.scss",
})
export class CustomFanComponent {
  mode_value: string = ' ';
  
  private fanService = inject(FanService)
  
  save_and_apply()
  {
    this.fanService.changeMode(this.mode_value)
    invoke("local_storage", {function: "save", option: "fan_curves", value: this.lineChartData.datasets[0].data.toString()})
  }
  fan_profiles(event: MouseEvent)
  {
    let fan_profile = (event.target as HTMLInputElement).value;
    console.log(fan_profile);
    switch(fan_profile)
    {
      case "Default":
        this.lineChartData.datasets[0].data = [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100];
        break;
      case "Aggressive":
        this.lineChartData.datasets[0].data = [0, 10, 40, 50, 60, 90, 100, 100, 100, 100, 100, 100];
        break;
      case "Quiet":
        this.lineChartData.datasets[0].data = [0, 15, 20, 30, 40, 55, 90, 100, 100, 100, 100, 100];
        break;
    }
    this.chart?.update();
    this.mode_value = fan_profile;
  }

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartData: ChartConfiguration["data"] = {
    
    datasets: [
      {
        data: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100],
        label: "Fan Speed In Percentage",
        backgroundColor: "rgba(232,72,85,0.1)",
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
