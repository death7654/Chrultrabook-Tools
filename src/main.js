import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from "@tauri-apps/api/event";
import { os } from "os-utils";
import "./styles.css";

document
  .getElementById("minimize")
  .addEventListener("click", () => appWindow.minimize());

document
  .getElementById("close")
  .addEventListener("click", () => appWindow.close());

//homepage
setInterval(async () => {
  const cpuTempFunction = await invoke("get_cpu_temp");
  const ramUsage = await invoke("get_ram_usage");
  const cpuUsage = await invoke("get_cpu_usage");
  const stdout = await invoke("get_fan_rpm");

  document.getElementById("ramPercentage").innerText = ramUsage + "%";
  document.getElementById("cpuLoad").innerText = cpuUsage + "%";

  let sensors = 0;
  let temps = 0;
  cpuTempFunction.split("\n").forEach((line) => {
    const num = line.split("C)")[0].trim().split(" ").pop().trim();
    if (num && !isNaN(num)) {
      temps += parseFloat(num);
      sensors++;
    }
  });
  const averageTemp = temps / sensors;
  document.getElementById("cpuTemp").innerText = averageTemp.toFixed(0) + "°C";

  //sends information to fancontrol.html
  const fanSpeed = stdout.toString().split(":").pop().trim();
  document.getElementById("fanSpeed").innerText = fanSpeed + " RPM";
  document.getElementById("cpuTempFan").innerText =
    averageTemp.toFixed(0) + "°C";
}, 1000);



setTimeout(async () => {
  const bioslong = await invoke("get_bios_version");
  const boardnamelong = await invoke("get_board_name");
  const coreslong = await invoke("get_cpu_cores");
  const hostname = await invoke("get_hostname");
  const cpunamelong = await invoke("get_cpu_name");
  function systeminfodatatransfer() {
    console.log(bioslong);
    const bios = bioslong.split("\n")[1];
    const boardname = boardnamelong.split("\n")[1];
    const cores = coreslong.split("\n")[1];
    const cpuname = cpunamelong.split("\n")[1];

    document.getElementById("biosVersion").innerText = "Bios Version: " + bios;
    document.getElementById("boardname").innerText = "Boardname: " + boardname;
    document.getElementById("coreCPU").innerText = "Cores: " + cores + " Cores";
    document.getElementById("hostname").innerText = "Hostname: " + hostname;
    document.getElementById("cpuName").innerText = "CPU: " + cpuname;
  }
  systeminfodatatransfer();
}, 1500);
//setFanSpeeds

var autoFan = document.getElementById("fanAuto");
var offFan = document.getElementById("fanOff");
var maxFan = document.getElementById("fanMax");

function fanMax() {
  invoke("set_fan_max");
  autoFan.classList.remove("activeButton");
  offFan.classList.remove("activeButton");
  maxFan.classList.add("activeButton");
}
function fanOff() {
  invoke("set_fan_off");
  autoFan.classList.remove("activeButton");
  offFan.classList.add("activeButton");
  maxFan.classList.remove("activeButton");
}
function fanAuto() {
  invoke("set_fan_auto");
  autoFan.classList.add("activeButton");
  offFan.classList.remove("activeButton");
  maxFan.classList.remove("activeButton");
}

const buttonfanMax = document.getElementById("fanMax");
buttonfanMax.addEventListener("click", () => fanMax());

const buttonfanOff = document.getElementById("fanOff");
buttonfanOff.addEventListener("click", () => fanOff());

const buttonfanAuto = document.getElementById("fanAuto");
buttonfanAuto.addEventListener("click", () => fanAuto());

//
function getcbMem(){
  setTimeout(async ()=>{
    const cbmemdata = await invoke("get_cbmem");
    document.getElementById("cbMemInfo").innerText = cbmemdata;

  }, 1000)
}

const buttoncbMem = document.getElementById("cbMem");
buttoncbMem.addEventListener("click", () => getcbMem());

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
document.querySelector("#copyButton").addEventListener("click", () => {
  copyTxt(document.querySelector("#cbMemInfo"));
});

document.getElementById("githuburl").addEventListener('click', invoke('open_link'))
