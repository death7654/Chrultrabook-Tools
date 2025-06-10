import { Component, ViewChild, inject } from "@angular/core";
import { ChartConfiguration } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { FanService } from "../../services/fan.service";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-fan-data",
  imports: [BaseChartDirective],
  templateUrl: "./fan-data.component.html",
  styleUrl: "./fan-data.component.scss"
})
export class FanDataComponent {
  fan_service: FanService = inject(FanService);
  button_label: string = "Collect Data";
  data_label: string = "Show All Data";
  label: number = 0;
  interval: any;
  tiny_cpu: any = [];
  tiny_rpm: any = [];
  tiny_label: any = [];
  data_cpu: any = [];
  data_rpm: any = [];
  total_label: any = [];

  @ViewChild("myChart") myChart?: BaseChartDirective;
  @ViewChild("myChart2") myChart2?: BaseChartDirective;

  collect() {
    const time = Number(
      (document.getElementById("time") as HTMLInputElement).value,
    );
    if (this.button_label == "Collect Data") {
      this.button_label = "Stop Collect";
      this.interval = setInterval(async () => {
        this.showData(time);
      }, time);
    } else {
      this.label = 0;
      this.button_label = "Collect Data";
      clearInterval(this.interval);
    }
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
    this.tiny_cpu = [];
    this.tiny_rpm = [];
    this.tiny_label = [];
    this.data_cpu = [];
    this.data_rpm = [];
    this.total_label = [];
    if (this.data_label == "Show All Data") {
      this.smallData();
    } else {
      this.allData();
    }
    this.updateChart();
  }

  retrieveCollectedData() {
    if (this.data_label == "Show All Data") {
      this.data_label = "Show Last 10";
      this.allData();
    } else {
      this.data_label = "Show All Data";
      this.smallData();
    }
    this.updateChart();
  }

  updateChart() {
    this.myChart?.update();
    this.myChart2?.update();
  }

  async showData(time: number) {
    const cpuDataArrayLength = this.lineChartData.datasets[0].data.length;
    const tempOutput: any = await invoke("get_temps");
    const output: string = await invoke("execute", {
      program: "ectool",
      arguments: ["pwmgetfanrpm", "all"],
      reply: true,
    });
    const split = output.split(" ");
    const temp = Number(tempOutput);
    const rpm = Number(split[3]);

    this.label = this.label + time / 1000;

    if (cpuDataArrayLength > 9) {
      this.tiny_cpu.splice(0, 1);
      this.tiny_label.splice(0, 1);
      this.tiny_rpm.splice(0, 1);
    }
    this.tiny_cpu.push(temp);
    this.tiny_rpm.push(rpm);
    this.tiny_label.push(this.label.toString());
    this.data_cpu.push(temp);
    this.data_rpm.push(rpm);
    this.total_label.push(this.label.toString());
    this.smallData();
    this.updateChart();
  }

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
