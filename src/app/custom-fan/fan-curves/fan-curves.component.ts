import { Component, ViewChild, inject, OnInit } from "@angular/core";
import { FanSectionComponent } from "../../home/fan-section/fan-section.component";
import { FanService } from "../../services/fan.service";
import { profile } from "../../services/profiles";
import { NgFor } from "@angular/common";

import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, Chart } from "chart.js/auto";
import type from "../../../types/chartjs-plugin-dragdata";
import DragData from "chartjs-plugin-dragdata";

@Component({
  selector: "app-fan-curves",
  standalone: true,
  imports: [BaseChartDirective, FanSectionComponent, NgFor],
  templateUrl: "./fan-curves.component.html",
  styleUrl: "./fan-curves.component.scss",
})
export class FanCurvesComponent implements OnInit {
  mode_value: string = " ";
  selected_mode: number = 10000;
  profiles: profile[] = [];
  fan_service: FanService = inject(FanService);

  constructor() {
    setTimeout(() => {
      this.profiles = this.fan_service.getProfiles();
      console.log(this.profiles);
      setTimeout(() => {
        this.fan_profiles();
      });
    }, 550);

    this.fan_service.getIndex.subscribe(index => this.selected_mode = index);
  }

  ngOnInit() {
    Chart.register(DragData);
  }

  save() {
    const name = (document.getElementById("selector") as HTMLInputElement).value;
    const index = this.fan_service.getProfileIndexByName(name);
    console.log(index);
    this.fan_service.editFanCurves(index, this.lineChartData.datasets[0].data);
  }
  saveAndApply() {
    this.save();
    const name = (document.getElementById("selector") as HTMLInputElement).value;
    const index = this.fan_service.getProfileIndexByName(name);
    this.fan_service.setMode(index);
    this.fan_service.saveSelected(index);
  }

  fan_profiles() {
    const profile = (document.getElementById("selector") as HTMLInputElement)
      .value;
      const array = this.fan_service.getProfileArrayByName(profile);
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
        pointBackgroundColor: "#fff",
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
          color: "#797979",
        },
      },
      x: {
        grid: {
          color: "#797979",
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
        }
      },
    },
  };
}
