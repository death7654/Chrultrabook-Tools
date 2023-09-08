import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { os } from "os-utils";
import "./styles.css";

document.getElementById("minimize").addEventListener("click", () => appWindow.minimize());

document.getElementById("close").addEventListener("click", () => appWindow.close());

//homepage
setInterval(async () => {
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
  const averageTemp = temps / sensors;
  document.getElementById("cpuTemp").innerText = averageTemp.toFixed(0) + "°C";
  //sends information to fancontrol.html
  document.getElementById("cpuTempFan").innerText = averageTemp.toFixed(0) + "°C";

},1000);
//fanspeed rpm
setInterval(async () => {
  const stdout = await invoke("get_fan_rpm");
  const fanSpeed = stdout.toString().split(":").pop().trim();
  document.getElementById("fanSpeed").innerText = fanSpeed + " RPM";
},1000);


//setFanSpeeds

var autoFan = document.getElementById("fanAuto");
var offFan = document.getElementById("fanOff");
var maxFan = document.getElementById("fanMax");

function fanMax(){
  invoke('set_fan_max')
autoFan.classList.remove("activeButton");
offFan.classList.remove("activeButton");
maxFan.classList.add("activeButton");
}
function fanOff(){
  invoke('set_fan_off')
autoFan.classList.remove("activeButton");
offFan.classList.add("activeButton");
maxFan.classList.remove("activeButton");
}
function fanAuto(){
  invoke('set_fan_auto')
autoFan.classList.add("activeButton");
offFan.classList.remove("activeButton");
maxFan.classList.remove("activeButton");
}

const buttonfanMax = document.getElementById('fanMax');
buttonfanMax.addEventListener('click', () => fanMax());

const buttonfanOff = document.getElementById('fanOff');
buttonfanOff.addEventListener('click', () => fanOff());

const buttonfanAuto = document.getElementById('fanAuto');
buttonfanAuto.addEventListener('click', () =>  fanAuto());

//cbmem
function cbmemDataTransfer(){
  const cbmemdata = invoke('cbmem')
  document.getElementById("cbMemInfo").innerText = cbmemdata;
}

const buttoncbMem = document.getElementById('cbMem');
buttoncbMem.addEventListener('click', () => cbmemDataTransfer())

function copyTxt (htmlElement) {
  if(!htmlElement) return;

  let elementText = htmlElement.innerText;

  let inputElement = document.createElement('input');
  inputElement.setAttribute('value', elementText);
  document.body.appendChild(inputElement);
  inputElement.select();
  document.execCommand('copy');
  inputElement.parentElement.removeChild(inputElement);

}
document.querySelector('#copyButton').addEventListener("click", () => {
  copyTxt(document.querySelector('#cbMemInfo'))
})
