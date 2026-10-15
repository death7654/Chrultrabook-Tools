import {
  Component,
  ViewChild,
  inject,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FanService } from "../../services/fan.service";
import { profile } from "../../services/profiles";

import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, Chart } from "chart.js/auto";
import DragData from "chartjs-plugin-dragdata";

@Component({
  selector: "app-fan-curves",
  imports: [BaseChartDirective, FormsModule],
  templateUrl: "./fan-curves.component.html",
  styleUrl: "./fan-curves.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FanCurvesComponent implements OnInit, OnDestroy {
  selectedIndex = -1;
  loading = true;
  saving = false;
  error = "";
  private destroyed = false;
  profiles: profile[] = [];
  fan_service: FanService = inject(FanService);

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    Chart.register(DragData);
    try {
      await this.fan_service.ready;
      if (this.destroyed) return;
      this.profiles = this.fan_service.getProfiles();
      const selected = this.profiles.findIndex((item) => item.selected);
      this.selectProfile(selected >= 0 ? selected : 0);
    } catch (error) {
      console.error("fan-curves: failed to load profiles:", error);
      this.error = "Unable to load fan profiles.";
    } finally {
      this.loading = false;
      if (!this.destroyed) this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  selectProfile(index: number) {
    const item = this.profiles[index];
    if (!item) {
      this.selectedIndex = -1;
      return;
    }
    this.selectedIndex = index;
    // Chart.js/dragdata mutates its dataset; never share it with saved profiles.
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [{ ...this.lineChartData.datasets[0], data: [...item.array] }],
    };
    this.error = "";
  }

  async save(apply = false) {
    if (this.loading || this.saving || this.selectedIndex < 0) return;
    this.saving = true;
    this.error = "";
    this.cdr.markForCheck();
    const index = this.selectedIndex;
    const name = this.profiles[index].name;
    const curve = [...this.lineChartData.datasets[0].data] as number[];
    try {
      await this.fan_service.saveCurve(index, curve, apply);
      if (apply) {
        await this.fan_service.applyCurve(name, curve);
      }
    } catch (error) {
      console.error("fan-curves: save/apply failed:", error);
      this.error = "Unable to save or apply the fan curve. Please retry.";
    } finally {
      this.saving = false;
      if (!this.destroyed) this.cdr.markForCheck();
    }
  }
  saveAndApply() {
    return this.save(true);
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
    animation: false,
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
        //if this errors out and the charjs graph still works, ignore, as the type is declared in an extrnal file
        onDragStart: (e: MouseEvent, datasetIndex: number, index: number) => {
          if (datasetIndex === 0 && index === 0) {
            // this would prohibit dragging the first datapoint in the first dataset entirely
            return false;
          } else if (datasetIndex === 0 && index === 11) {
            return false;
          }
          return true;
        },
      },
    },
  };
}
