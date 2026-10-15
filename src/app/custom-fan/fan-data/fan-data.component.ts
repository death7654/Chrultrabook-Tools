import { Component, ViewChild, OnDestroy, signal } from "@angular/core";
import { ChartConfiguration } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { invoke } from "@tauri-apps/api/core";
import { ec } from "../../services/device";

@Component({
  selector: "app-fan-data", imports: [BaseChartDirective],
  templateUrl: "./fan-data.component.html", styleUrl: "./fan-data.component.scss",
})
export class FanDataComponent implements OnDestroy {
  readonly collecting = signal(false);
  readonly error = signal("");
  data_label = "Show All Data";
  label = 0;
  interval?: ReturnType<typeof setInterval>;
  tiny_cpu: number[] = [];
  tiny_rpm: number[] = [];
  tiny_label: string[] = [];
  data_cpu: number[] = [];
  data_rpm: number[] = [];
  total_label: string[] = [];
  private sampling = false;
  private destroyed = false;
  private revision = 0;
  private started = 0;
  @ViewChild("myChart") myChart?: BaseChartDirective;
  @ViewChild("myChart2") myChart2?: BaseChartDirective;

  collect(value: string) {
    if (this.collecting()) { this.stop(); return; }
    const time = Number(value);
    if (!Number.isFinite(time) || time < 1000 || time > 600000) {
      this.error.set("Choose a valid sampling interval."); return;
    }
    this.started = Date.now() - this.label * 1000;
    this.collecting.set(true); this.error.set("");
    this.interval = setInterval(() => { void this.showData(); }, time);
  }
  private stop() {
    clearInterval(this.interval); this.interval = undefined;
    this.collecting.set(false); ++this.revision;
  }
  smallData() {
    this.lineChartData.datasets[0].data = this.tiny_cpu;
    this.lineChartData2.datasets[0].data = this.tiny_rpm;
    this.lineChartData.labels = this.tiny_label;
    this.lineChartData2.labels = this.tiny_label;
  }
  allData() {
    this.lineChartData.datasets[0].data = this.data_cpu;
    this.lineChartData2.datasets[0].data = this.data_rpm;
    this.lineChartData.labels = this.total_label;
    this.lineChartData2.labels = this.total_label;
  }
  clear() {
    ++this.revision; this.label = 0; this.started = Date.now();
    this.tiny_cpu = []; this.tiny_rpm = []; this.tiny_label = [];
    this.data_cpu = []; this.data_rpm = []; this.total_label = [];
    this.render();
  }
  retrieveCollectedData() {
    this.data_label = this.data_label === "Show All Data" ? "Show Last 10" : "Show All Data";
    this.render();
  }
  private render() {
    if (this.data_label === "Show All Data") this.smallData(); else this.allData();
    this.myChart?.update("none"); this.myChart2?.update("none");
  }
  async showData() {
    if (this.sampling || !this.collecting() || this.destroyed) return;
    this.sampling = true;
    const revision = this.revision;
    try {
      const temp = Number(await invoke("get_temps"));
      if (this.destroyed || !this.collecting() || revision !== this.revision) return;
      const output = await ec(["pwmgetfanrpm", "all"]);
      if (this.destroyed || !this.collecting() || revision !== this.revision) return;
      const rpms = [...output.matchAll(/(?:RPM:\s*|fan\s*\d+\s*:\s*)(\d+)/gi)].map((match) => Number(match[1]));
      if (!Number.isFinite(temp) || temp <= 0 || !rpms.length) throw new Error("Invalid sample");
      const rpm = Math.max(...rpms);
      this.label = Math.round((Date.now() - this.started) / 100) / 10;
      this.data_cpu.push(temp); this.data_rpm.push(rpm); this.total_label.push(String(this.label));
      // Bound memory use during long unattended sessions.
      if (this.data_cpu.length > 3600) { this.data_cpu.shift(); this.data_rpm.shift(); this.total_label.shift(); }
      this.tiny_cpu = this.data_cpu.slice(-10); this.tiny_rpm = this.data_rpm.slice(-10); this.tiny_label = this.total_label.slice(-10);
      this.error.set(""); this.render();
    } catch (error) {
      if (!this.destroyed && revision === this.revision) this.error.set("Unable to read a sample. Collection will retry.");
    } finally { this.sampling = false; }
  }
  ngOnDestroy() { this.destroyed = true; this.stop(); }

  public lineChartData: ChartConfiguration["data"] = {
    datasets: [
      {
        data: [],
        label: "CPU Temperatures in Celsius",
        backgroundColor: "rgba(232,72,85,0.1)",
        borderColor: "#FF6694",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(148,159,177,0.8)",
        stack: "a",
        yAxisID: "y",
      },
    ],
    labels: [],
  };
  public lineChartOptions: ChartConfiguration["options"] = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
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
      legend: { display: true },
    },
  };
  public lineChartData2: ChartConfiguration["data"] = {
    datasets: [
      {
        data: [],
        label: "Fan Speed in RPM",
        backgroundColor: "rgba(232,72,85,0.1)",
        borderColor: "#FF6694",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(77,83,96,1)",
        stack: "b",
      },
    ],
    labels: [],
  };
}
