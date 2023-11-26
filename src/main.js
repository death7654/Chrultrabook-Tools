import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { disable, isEnabled, enable } from "tauri-plugin-autostart-api";
import {
  Chart,
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
} from "chart.js";
Chart.register(
  LineController,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip
);
import "chartjs-plugin-dragdata";
import "./styles.css";
//prevents rightclick
document.addEventListener("contextmenu", (event) => event.preventDefault());
//checks what os the user is on
let os;
(async () => {
  os = await invoke("check_os");
  //hides things currently incopatiable with linux and macos
  if (os !== "windows") {
    document.getElementById("startOnBoot").style.display = "none";
    document.getElementById("startHidden").style.display = "none";
    document.getElementById("startOnBootButton").style.display = "none";
    document.getElementById("startHiddenButton").style.display = "none";
  }
  if (os === "macos") {
    document.getElementById("biosVersion").style.display = "none";
    document.getElementById("boardname").style.display = "none";
    document.getElementById("nomacos1").remove();
    document.getElementById("nomacos2").remove();
    document.getElementById("nomacos3").remove();
  }
})();
//settings menu
const startupFan = document.getElementById("startupFansInput");
const systemTray = document.getElementById("systemTrayInput");
const startHidden = document.getElementById("startHiddenInput");
const startOnBoot = document.getElementById("startOnBootInput");
//start Hidden
const hideOnStart = localStorage.getItem("startHidden");
if (hideOnStart === "yes") {
  //closes splash screen
  invoke("close_splashscreen");
  appWindow.hide();
  startHiddenInput.checked = true; //TODO: Error: unresolved
}
//app close and open functions
document.getElementById("close").addEventListener("mousedown", () => {
  let addToTray = localStorage.getItem("quitToTray");
  if (addToTray === "yes") {
    appWindow.hide();
    systemTrayInput.checked = true; //TODO: Error: unresolved
  } else {
    invoke("quit_cmd");
  }
});
document
  .getElementById("minimize")
  .addEventListener("mousedown", () => appWindow.minimize());
//function to check if a number exist
function containsNumber(str) {
  return /[0-9]/.test(str);
}

// checks if fan exists
let fan = true;
invoke("get_fan_rpm").then((x) => {
  if (!containsNumber(x.split(/\b(\s)/))) {
    document.getElementById("fan").style.display = "none";
    fan = false;
  }
});

//sets current percantage for backlight and hides the slider if the chromebook has no backlight or battery controls
setTimeout(async () => {
  let keyboardBackLight = await invoke("ectool", {
    value: "pwmgetkblight",
    value2: "",
  });
  keyboardBackLight = keyboardBackLight.split(" ");
  //prevents laptops with no backlight form seeing this
  //1 is EC ERROR 1
  if (keyboardBackLight[3] === "1") {
    document.getElementById("rangeBacklight").style.display = "none";
    document.getElementById("rangeBacklightslider").style.display = "none";
  }
  if (keyboardBackLight[4] !== "0") {
    document.getElementById("backlightRangeSliderText").innerText =
      keyboardBackLight[4];
    document.getElementById("backlightRangeSlider").value =
      keyboardBackLight[4];
  } else {
    document.getElementById("backlightRangeSliderText").innerText = "off";
  }
}, 0);
//homepage
//cpu and ram
let averageTemp;
async function startCpuRamInterval() {
  const ramUsage = await invoke("get_ram_usage");
  const cpuUsage = await invoke("get_cpu_usage");
  document.getElementById("ramPercentage").innerText = ramUsage + "%";
  document.getElementById("cpuLoad").innerText = cpuUsage + "%";
}
//seperates temps, so ectool doesnt spam errors
async function startTempinterval() {
  //cpu temps
  let cpuTemp = await invoke("get_cpu_temp");
  document.getElementById("cpuTemp").innerText = cpuTemp + "°C";
  document.getElementById("cpuTempFan").innerText = cpuTemp + "°C";
}
let tempInterval = setInterval(async () => {
  startTempinterval();
}, 1000);

//stops ectools from trying to run and displays no ectools
setTimeout(async () => {
  if (await invoke("check_ec")) {
    clearInterval(tempInterval);
    document.getElementById("noEctools").style.display = "block";
    document.getElementById(os).style.display = "flex";
  }
}, 2000);

let intervalStarted = false;
let previousInterval = false;
let cpuRamInterval;
setInterval(async () => {
  let focus = await appWindow.isVisible();
  if (focus === false && intervalStarted === false) {
    clearInterval(cpuRamInterval);
    cpuRamInterval = setInterval(async () => {
      startCpuRamInterval();
    }, 10000);
    intervalStarted = true;
  } else if (focus === true && intervalStarted === false) {
    clearInterval(cpuRamInterval);
    cpuRamInterval = setInterval(async () => {
      startCpuRamInterval();
    }, 1000);
    intervalStarted = true;
  } else if (focus !== previousInterval) {
    intervalStarted = false;
  }
}, 1000);

//only allows fanRPM, and fanTEMPS to execute if a fan is found
if (fan === true) {
  setInterval(async () => {
    let fanRPM = await invoke("get_fan_rpm");
    document.getElementById("fanSpeed").innerText = fanRPM + " RPM";
  }, 1000);
  //loads chart on startup
  setTimeout(async () => {
    let fanCurve = JSON.parse(localStorage.getItem("customfanCurves"));
    //adds chart for new installs/users
    if (fanCurve == null) {
      myChart.config.data.datasets[0].data = [
        0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100,
      ];
    } else {
      myChart.config.data.datasets[0].data = fanCurve;
    }
  }, 0);
}
//Grabs System Info
setTimeout(async () => {
  const hostname = await invoke("get_hostname");
  const bios = await invoke("get_bios_version");
  const boardname = await invoke("get_board_name");
  const cores = await invoke("get_cpu_cores");
  const cpuname = await invoke("get_cpu_name");
  const threads = await invoke("get_cpu_threads");
  document.getElementById("biosVersion").innerText = "Bios Version: " + bios;
  document.getElementById("boardname").innerText = "Boardname: " + boardname;
  document.getElementById("threadCPU").innerText =
    "Threads: " + threads + " Threads";
  document.getElementById("hostname").innerText = "Hostname: " + hostname;
  document.getElementById("cpuName").innerText =
    "CPU: " + cores + " ⋅ " + cpuname;
  //shows or hides activity light settings based on boardname (only shows to Candy and Kefka)
  if (boardname !== "Candy" && boardname !== "Kefka") {
    document.getElementById("ActivityLight").style.display = "none";
    document.getElementById("keyboardBacklight").classList.add("afterCheck");
  }
}, 0);

//Fan Speed
//Draggable Fan Chart
const data = {
  //9 data in X-axis
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
      label: "Fan Speed",
      //The 10th vaue is to keep the chart from lowering to 1
      data: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100],
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
//chart config
const config = {
  type: "line",
  data: data,
  dragData: true,
  legend: {
    display: false,
  },
  options: {
    //makes lines not so straight
    tension: 0.2,
    legend: false,
    plugins: {
      dragData: {
        round: 0,
        showTooltip: true,
        onDragStart: () => { },
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
//TODO: x2 Error: Type / not assignable
const myChart = new Chart(document.getElementById("fancurves"), config);
myChart.update();
let autoFan = document.getElementById("fanAuto");
let offFan = document.getElementById("fanOff");
let maxFan = document.getElementById("fanMax");
let setFan = document.getElementById("setFan");

console.log(myChart.data.datasets[0].data);

function setTemps() {
  invoke("custom_fan_speeds", { value: myChart.data.datasets[0].data });
}
let clearcustomFan;
//starts fans if avaliable

const fanOnStart = localStorage.getItem("fanOnStart");
if (fanOnStart === "yes") {
  startupFansInput.checked = true; //TODO: Error: unresolved
  clearcustomFan = setInterval(async () => {
    setTemps();
  }, 2000);
}
//sets customFanCurves
function customFan() {
  autoFan.classList.remove("activeButton");
  offFan.classList.remove("activeButton");
  maxFan.classList.remove("activeButton");
  setFan.classList.add("activeButton");
  clearInterval(clearcustomFan);
  clearcustomFan = setInterval(async () => {
    setTemps();
  }, 500);
  //saves the users custom fan curves
  const toSave = JSON.stringify(myChart.data.datasets[0].data);
  localStorage.setItem("customfanCurves", toSave);
}
//sets fan to max speed
function fanMax() {
  autoFan.classList.remove("activeButton");
  offFan.classList.remove("activeButton");
  maxFan.classList.add("activeButton");
  setFan.classList.remove("activeButton");
  clearInterval(clearcustomFan);
  //changes chart and uses built in protections for the fan
  myChart.config.data.datasets[0].data = [
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  ];
  myChart.update();
  clearcustomFan = setInterval(async () => {
    setTemps();
  }, 2000);
}
//turns fan off
function fanOff() {
  invoke("ectool", {
    value: "fanduty",
    value2: "0",
  });
  autoFan.classList.remove("activeButton");
  offFan.classList.add("activeButton");
  maxFan.classList.remove("activeButton");
  setFan.classList.remove("activeButton");
  clearInterval(clearcustomFan);
  //changes chart and uses built in protections for the fan
  myChart.config.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 100];
  myChart.update();
  clearcustomFan = setInterval(async () => {
    setTemps();
  }, 2000);
}
//sets fan to the best fan curves
function fanAuto() {
  invoke("ectool", {
    value: "autofanctrl",
    value2: "",
  });
  autoFan.classList.add("activeButton");
  offFan.classList.remove("activeButton");
  maxFan.classList.remove("activeButton");
  setFan.classList.remove("activeButton");
  clearInterval(clearcustomFan);
  //changes chart and uses built in protections for the fan (better fan curves than ectools)
  myChart.config.data.datasets[0].data = [
    0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100,
  ];
  myChart.update();
  clearcustomFan = setInterval(async () => {
    setTemps();
  }, 2000);
}
//assigns each button to each fan function
const buttonfanMax = document.getElementById("fanMax");
buttonfanMax.addEventListener("mousedown", () => fanMax());
const buttonfanOff = document.getElementById("fanOff");
buttonfanOff.addEventListener("mousedown", () => fanOff());
const buttonfanAuto = document.getElementById("fanAuto");
buttonfanAuto.addEventListener("mousedown", () => fanAuto());
const buttonCustomFan = document.getElementById("setFan");
buttonCustomFan.addEventListener("mousedown", () => customFan());
//system options

//activity light
const selectedActivityLight = document.querySelector(".selectedActivityLight");
async function activityLight() {
  invoke("set_activity_light", { color: selectedActivityLight.innerText });
}
const activityLightColor = document.getElementById("activityLightMenu");
activityLightColor.addEventListener("mousedown", () => activityLight());

//keyboard backlight slider
let sliderBacklight = document.getElementById("backlightRangeSlider");
let outputBacklight = document.getElementById("backlightRangeSliderText");
outputBacklight.innerHTML = sliderBacklight.value;

//sends infrom from html to ec and changes keyboard remap opacity
sliderBacklight.oninput = function () {
  outputBacklight.innerText = this.value === "0" ? "off" : this.value;
  invoke("ectool", {
    value: "pwmsetkblight",
    value2: sliderBacklight.value,
  });
  //changes text color
  document.getElementById("key").style.filter =
    sliderBacklight.value < 25 || this.value === "0"
      ? "opacity(25%)"
      : "opacity(" + sliderBacklight.value + "%)";
};
//batteryControl
/*
let chargerSlider = document.getElementById("chargerSlider");
let chargerOutputBacklight = document.getElementById("chargerSliderText");
chargerOutputBacklight.innerHTML = chargerSlider.value;

chargerSlider.oninput = function () {
  chargerOutputBacklight.innerText = this.value;
};

function setChargeControl() {
  let upperLimit = chargerSlider.value;
  let lowerLimit = upperLimit - 5;
  lowerLimit = lowerLimit.toString();
  invoke("set_battery_limit", { value: lowerLimit, value2: upperLimit });
}
function setDefault() {
  invoke("set_battery_limit", { value: "", value2: "" });
}

document
  .getElementById("chargeControlSet")
  .addEventListener("mousedown", () => setChargeControl());

document
  .getElementById("chargeControlDefault")
  .addEventListener("mousedown", () => setDefault());
*/
//sends info from html to ec, and pulls ec and sends it to HTML (system diagnostics)
const selected = document.querySelector(".selected");
async function getSystemInfo() {
  document.getElementById("cbMemInfo").innerText =
    "\n" + (await invoke("get_system_info", { value: selected.innerText }));
}

//copy functions
const buttoncbMem = document.getElementById("cbMem");
buttoncbMem.addEventListener("mousedown", () => getSystemInfo());
const cbmemMenu = document.getElementById("cbmemMenu");
cbmemMenu.addEventListener("mousedown", () => getSystemInfo());

function copyTxt(htmlElement) {
  if (!htmlElement) return;
  let elementText = htmlElement.innerText;
  let inputElement = document.createElement("input");
  inputElement.setAttribute("value", elementText);
  document.body.appendChild(inputElement);
  inputElement.select();
  document.execCommand("copy"); //TODO: deprecated
  inputElement.parentElement.removeChild(inputElement);
}
document.querySelector("#copyButton").addEventListener("mousedown", () => {
  copyTxt(document.querySelector("#cbMemInfo"));
});
//sets up local storage for settings so all options that are checked stay checked upon reboot
startupFan.addEventListener("click", () => {
  if (startupFan.checked) {
    localStorage.setItem("fanOnStart", "yes");
  } else {
    localStorage.setItem("fanOnStart", "no");
  }
});
systemTray.addEventListener("click", () => {
  if (systemTray.checked) {
    localStorage.setItem("quitToTray", "yes");
  } else {
    localStorage.setItem("quitToTray", "no");
  }
});
const closetoTray = localStorage.getItem("quitToTray");
if (closetoTray === "yes") {
  systemTray.checked = true;
}
startHidden.addEventListener("click", () => {
  if (startHidden.checked) {
    localStorage.setItem("startHidden", "yes");
  } else {
    localStorage.setItem("startHidden", "no");
  }
});
startOnBoot.addEventListener("click", () => {
  if (startOnBoot.checked) {
    localStorage.setItem("startOnBoot", "yes");
    setTimeout(async () => await enable());
  } else {
    localStorage.setItem("startOnBoot", "no");
    setTimeout(async () => await disable());
  }
});

//sets start on boot to checked if true
isEnabled().then((v) => (startOnBoot.checked = true));
