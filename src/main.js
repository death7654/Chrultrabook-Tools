import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import "chartjs-plugin-dragdata";
import "./styles.css";
//app close and open functions
document
  .getElementById("minimize")
  .addEventListener("mousedown", () => appWindow.minimize());

document
  .getElementById("close")
  .addEventListener("mousedown", () => appWindow.close());

//check for os type and hides things incompaitable
setTimeout(async () => {
  const os = await invoke("is_windows");
  //hides items not compatiable with linux
  if (os == "true") {
    document.getElementById("noLinux").style.display = "none";
    document.getElementById("noLinux2").style.display = "none";
    document.getElementById("noLinux3").style.display = "none";
  }
}, 1000);
//function to check if a number exist
function containsNumber(str) {
  return /\d/.test(str);
}
//checks if fan exists
let fan = null;
const fanExist = await invoke("get_fan_rpm");
if (containsNumber(fanExist)) {
  fan = true;
} else {
  fan = false;
  document.getElementById("fan").style.display = "none";
}

//homepage
var averageTemp;
setInterval(async () => {
  const ramUsage = await invoke("get_ram_usage");
  const cpuUsage = await invoke("get_cpu_usage");
  document.getElementById("ramPercentage").innerText = ramUsage + "%";
  document.getElementById("cpuLoad").innerText = cpuUsage + "%";

  //cpu temps
  const cpuTempFunction = await invoke("get_cpu_temp");
  let sensors = 0;
  let temps = 0;
  cpuTempFunction.split("\n").forEach((line) => {
    const num = line.split("C)")[0].trim().split(" ").pop().trim();
    if (num && !isNaN(num)) {
      temps += parseFloat(num);
      sensors++;
    }
  });
  averageTemp = temps / sensors;
  document.getElementById("cpuTemp").innerText = averageTemp.toFixed(0) + "°C";

  //sends information to fan control if it exists
  if (fan == true) {
    const fanRPM = await invoke("get_fan_rpm");
    const fanSpeed = fanRPM.toString().split(":").pop().trim();
    document.getElementById("fanSpeed").innerText = fanSpeed + " RPM";
    document.getElementById("cpuTempFan").innerText =
      averageTemp.toFixed(0) + "°C";
  }
}, 1000);

setTimeout(async () => {
  const hostname = await invoke("get_hostname");
  const bios = await invoke("get_bios_version");
  const boardname = await invoke("get_board_name");
  const cores = await invoke("get_cpu_cores");
  const cpuname = await invoke("get_cpu_name");
  document.getElementById("biosVersion").innerText = "Bios Version: " + bios;
  document.getElementById("boardname").innerText = "Boardname: " + boardname;
  document.getElementById("coreCPU").innerText = "Cores: " + cores + " Cores";
  document.getElementById("hostname").innerText = "Hostname: " + hostname;
  document.getElementById("cpuName").innerText = "CPU: " + cpuname;
}, 0);
//setFanSpeeds
//fan chart
const data = {
  labels: ["35°C", "40°C", "45°C", "50°C", "55°C", "60°C"],
  datasets: [
    {
      label: "Fan Speed",
      data: [0, 20, 20, 50, 50, 100, 100],
      backgroundColor: [
        "rgba(255, 26, 104, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
        "rgba(0, 0, 0, 0.2)",
      ],
      borderColor: [
        "rgba(255, 26, 104, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(0, 0, 0, 1)",
      ],
      borderWidth: 1,
      dragData: true,
      pointHitRadius: 26,
    },
  ],
};

const config = {
  type: "line",
  data: data,
  dragData: true,
  legend: {
    display: false,
  },
  dragData: true,
  options: {
    tension: 0.2,
    legend: false,
    plugins: {
      dragData: {
        round: 0,
        showTooltip: true,
        onDragStart: (event) => {
          if (element.datasetIndex === 5 && element.index === 5) {
            return false;
          }
          else {
            return true;
          }
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Fan Speed In Percentage",
        },
      },
      x: {
        title: {
          display: true,
          text: "CPU Temperature",
        },
      },
    },
  },
};
//render chart
const myChart = new Chart(document.getElementById("fancurves"), config);
myChart.update();

let autoFan = document.getElementById("fanAuto");
let offFan = document.getElementById("fanOff");
let maxFan = document.getElementById("fanMax");
let setFan = document.getElementById("setFan");

async function setTemps() {
  var cpuTemp = parseInt(averageTemp);
  let tempA = myChart.data.datasets[0].data[0];
  let tempB = myChart.data.datasets[0].data[1];
  let tempC = myChart.data.datasets[0].data[2];
  let tempD = myChart.data.datasets[0].data[3];
  let tempE = myChart.data.datasets[0].data[4];

  if (cpuTemp < 35) {
    invoke("set_fan_off");
  } else if (cpuTemp >= 35 && cpuTemp < 40) {
    invoke("set_fan_speed", { value: tempA.toString() });
    console.log("less than 45");
  } else if (cpuTemp >= 40 && cpuTemp < 45) {
    invoke("set_fan_speed", { value: tempB.toString() });
    console.log(averageTemp);
    console.log("less than 50");
  } else if (cpuTemp >= 45 && cpuTemp < 50) {
    invoke("set_fan_speed", { value: tempC.toString() });
    console.log(tempC);
    console.log("less than 50");
  } else if (cpuTemp >= 50 && cpuTemp < 55) {
    invoke("set_fan_speed", { value: tempD.toString() });
    console.log(tempD);
    console.log("less than 55");
  } else if (cpuTemp >= 55 && cpuTemp < 60) {
    invoke("set_fan_speed", { value: tempE.toString() });
    console.log("less than 60");
  } else if (cpuTemp > 60) {
    invoke("set_fan_max");
  }
}
var clearcustomFan;

function customFan() {
  autoFan.classList.remove("activeButton");
  offFan.classList.remove("activeButton");
  maxFan.classList.remove("activeButton");
  setFan.classList.add("activeButton");
  clearcustomFan = setInterval(async () =>{setTemps()},2000);
}
function fanMax() {
  invoke("set_fan_max");
  autoFan.classList.remove("activeButton");
  offFan.classList.remove("activeButton");
  maxFan.classList.add("activeButton");
  setFan.classList.remove("activeButton");
  clearInterval(clearcustomFan);
}
function fanOff() {
  invoke("set_fan_off");
  autoFan.classList.remove("activeButton");
  offFan.classList.add("activeButton");
  maxFan.classList.remove("activeButton");
  setFan.classList.remove("activeButton");
  clearInterval(clearcustomFan);
}
function fanAuto() {
  invoke("set_fan_auto");
  autoFan.classList.add("activeButton");
  offFan.classList.remove("activeButton");
  maxFan.classList.remove("activeButton");
  setFan.classList.remove("activeButton");
  clearInterval(clearcustomFan);
}

const buttonfanMax = document.getElementById("fanMax");
buttonfanMax.addEventListener("mousedown", () => fanMax());

const buttonfanOff = document.getElementById("fanOff");
buttonfanOff.addEventListener("mousedown", () => fanOff());

const buttonfanAuto = document.getElementById("fanAuto");
buttonfanAuto.addEventListener("mousedown", () => fanAuto());

const buttonCustomFan = document.getElementById("setFan");
buttonCustomFan.addEventListener("mousedown", () => customFan());

//system infopage
//keyboard backlight slider
let sliderBacklight = document.getElementById("backlightRangeSlider");
let outputBacklight = document.getElementById("backlightRangeSliderText");
outputBacklight.innerHTML = sliderBacklight.value;

sliderBacklight.oninput = function () {
  if (this.value !== "0") {
    outputBacklight.innerText = this.value;
    //sends infrom from html to ec
    invoke("set_keyboard_backlight", { value: sliderBacklight.value });
  } else {
    outputBacklight.innerText = "off";
    //sends infrom from html to ec
    invoke("set_keyboard_backlight", { value: sliderBacklight.value });
  }
};

//sends infrom from html to ec

//sends info from ec to html
const selected = document.querySelector(".selected");
function getSystemInfo() {
  if (selected.innerText === "Boot Timestamps") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_cbmem"
      );
    }, 0);
  } else if (selected.innerText === "Coreboot Log") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_coreboot"
      );
    }, 0);
  } else if (selected.innerText === "Coreboot Extended Log") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_coreboot_long"
      );
    }, 0);
  } else if (selected.innerText === "EC Console Log") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_ec_console"
      );
    }, 0);
  } else if (selected.innerText === "Battery Info") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_battery"
      );
    }, 0);
  } else if (selected.innerText === "EC Chip Info") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_flash_chip"
      );
    }, 0);
  } else if (selected.innerText === "SPI Info") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_spi_info"
      );
    }, 0);
  } else if (selected.innerText === "EC Protocol Info") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_ec_protocol"
      );
    }, 0);
  } else if (selected.innerText === "Temp Sensor Info") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_temp_sensor"
      );
    }, 0);
  } else if (selected.innerText === "Power Delivery Info") {
    setTimeout(async () => {
      document.getElementById("cbMemInfo").innerText = await invoke(
        "get_power_delivery"
      );
    }, 0);
  } else {
    document.getElementById("cbMemInfo").innerText = "Select Something";
  }
}

//copy
const buttoncbMem = document.getElementById("cbMem");
buttoncbMem.addEventListener("mousedown", () => getSystemInfo());

function copyTxt(htmlElement) {
  if (!htmlElement) return;

  let elementText = htmlElement.innerText;

  let inputElement = document.createElement("input");
  inputElement.setAttribute("value", elementText);
  document.body.appendChild(inputElement);
  inputElement.select();
  document.execCommand("copy");
  inputElement.parentElement.removeChild(inputElement);
}
document.querySelector("#copyButton").addEventListener("mousedown", () => {
  copyTxt(document.querySelector("#cbMemInfo"));
});
