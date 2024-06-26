import { Component, QueryList, ViewChild, inject } from "@angular/core";
import { ChartConfiguration } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { FanService } from "../../services/fan.service";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-fan-data",
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: "./fan-data.component.html",
  styleUrl: "./fan-data.component.scss",
})
export class FanDataComponent {
  fan_service: FanService = inject(FanService);
  button_label: string = "Collect Data"
  label: number = 0;
  interval: any;

  @ViewChild("myChart") myChart?: BaseChartDirective;
  @ViewChild("myChart2") myChart2?: BaseChartDirective;


  collect() 
  {
    let time = (document.getElementById('time') as HTMLInputElement).value
    if(this.button_label == "Collect Data")
      {
        this.button_label = "Stop Collect";
        this.interval = setInterval(async () => {
          this.updateChart(Number(time))
        }, Number(time));
      }
      else
      {
        this.label = 0;
        this.button_label = "Collect Data"
        clearInterval(this.interval);
      }
}

clear()
{
  this.lineChartData.datasets[0].data = [];
  this.lineChartData.datasets[1].data = [];
  this.lineChartData.labels = [];
  this.lineChartData2.labels = [];
  this.myChart?.update();
  this.myChart2?.update();
}


  async updateChart(time: number) {
    let cpuDataArrayLength = this.lineChartData.datasets[0].data.length;
    let tempOutput: any = await invoke("get_temps");
    let output: string = await invoke("execute", { program: "ectool", arguments: ['pwmgetfanrpm', "all"], reply: true });
    let split = output.split(" ");
    let temp = Number(tempOutput);
    let rpm = Number(split[3]);

    this.label = this.label + time/1000;

    if (cpuDataArrayLength > 9) {
      this.lineChartData.datasets[0].data.splice(0, 1);
      this.lineChartData2.datasets[0].data.splice(0, 1);
      this.lineChartData.labels?.splice(0,1);
      this.lineChartData2.labels?.splice(0,1);
    } 
    this.lineChartData.datasets[0].data.push(temp);
    this.lineChartData2.datasets[0].data.push(rpm);
    this.lineChartData.labels?.push(this.label.toString());
    this.lineChartData2.labels?.push(this.label.toString());
    this.myChart?.update();
  this.myChart2?.update();
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
        stack: 'a',
        yAxisID: 'y',
      },
    ],
    labels: [],
  };
  public lineChartOptions: ChartConfiguration["options"] = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
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
        stack: 'b',
      },
    ],
    labels: [],
  };

}
