import { Component, ViewChild, inject } from "@angular/core";
import { FanSectionComponent } from "../../home/fan-section/fan-section.component";
import { FanService } from "../../services/fan.service";
import { profile } from "../../services/profiles";
import { ButtonComponent } from "../../button/button.component";
import { invoke } from "@tauri-apps/api/core";
import { NgFor } from "@angular/common";

import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, Chart } from "chart.js/auto";
import DragData from "chartjs-plugin-dragdata";

@Component({
  selector: "app-fan-curves",
  standalone: true,
  imports: [BaseChartDirective, ButtonComponent, FanSectionComponent, NgFor],
  templateUrl: "./fan-curves.component.html",
  styleUrl: "./fan-curves.component.scss",
})
export class FanCurvesComponent {
  mode_value: string = "Default";
  profiles: profile[] = [];
  fan_service: FanService = inject(FanService);
  selected_option: number = 10000000000

  constructor() {
    setTimeout(() => {
      this.profiles = this.fan_service.getProfiles();
    }, 550);
  }

  ngOnInit() {
    Chart.register(DragData);
  }
  saveArray()
  {
    let name = (document.getElementById('selector') as HTMLInputElement).value
    let index = this.fan_service.getProfileIndexByName(name)
    console.log(index);
  }

  save() {
    invoke("local_storage", {
      function: "save",
      option: "fan_curves",
      value: this.lineChartData.datasets[0].data.toString(),
    });
  }
  apply() {
    console.log("apply");
  }
  fan_profiles(event: MouseEvent) {
    let profile = (event.target as HTMLInputElement).value;
    let array = this.fan_service.getProfileArrayByName(profile);
    this.lineChartData.datasets[0].data = array!.array;
    this.chart?.update();
    this.mode_value = profile;
  }

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartData: ChartConfiguration["data"] = {
    datasets: [
      {
        data: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100, 100],
        label: "Fan Speed In Percentage",
        backgroundColor: "rgba(232,72,85,0.1)",
        borderColor: "#FF6694",
        pointBackgroundColor: "#FF6694",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(148,159,177,0.8)",
        fill: "origin",
        pointHitRadius: 25,
        tension: 0.3,
      },
    ],
    labels: [
      "30°C",
      "35°C",
      "40°C",
      "45°C",
      "50°C",
      "55°C",
      "60°C",
      "65°C",
      "70°C",
      "75°C",
      "80°C",
      "85°C",
    ],
  };

  public lineChartOptions: ChartConfiguration["options"] = {
    responsive: true,
    maintainAspectRatio: false,
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
      dragData: {
        round: 0,
        onDragStart: (
          e: MouseEvent,
          datasetIndex: number,
          index: number,
          value: any
        ) => {
          //console.log('Drag start:', datasetIndex, index, value);
          if (datasetIndex === 0 && index === 0) {
            // this would prohibit dragging the first datapoint in the first
            // dataset entirely
            return false;
          } else if (datasetIndex === 0 && index === 11) {
            return false;
          }
          return true;
        },
        onDrag: (
          e: MouseEvent,
          datasetIndex: number,
          index: number,
          value: any
        ) => {
          //console.log('Dragging:', datasetIndex, index, value);
        },
        onDragEnd: (
          e: MouseEvent,
          datasetIndex: number,
          index: number,
          value: any
        ) => {
          //console.log('Drag end:', datasetIndex, index, value);
        },
      },
    },
  };
}
