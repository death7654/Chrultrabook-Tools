const { invoke } = window.__TAURI__.tauri;
const { appWindow } = window.__TAURI__.window;

//check for os type and hides things incompaitable
setTimeout(async () => {
  const os = await invoke("get_os");
  //hides items not compatiable with linux
  if (os !== "Windows") {
    document.getElementById("noLinux").style.display = "none";
    document.getElementById("noLinux2").style.display = "none";
    document.getElementById("noLinux3").style.display = "none";
  }

}, 1000);

document
  .getElementById("minimize")
  .addEventListener("mousedown", () => appWindow.minimize());

document
  .getElementById("close")
  .addEventListener("mousedown", () => appWindow.close());

//homepage
setInterval(async () => {
  const ramUsage = await invoke("get_ram_usage");
  const cpuUsage = await invoke("get_cpu_usage");
  document.getElementById("ramPercentage").innerText = ramUsage + "%";
  document.getElementById("cpuLoad").innerText = cpuUsage + "%";

  //other custom info (ectools)
  const stdout = await invoke("get_fan_rpm");
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
  const fanSpeed = stdout.toString().split(":").pop().trim();
  document.getElementById("fanSpeed").innerText = fanSpeed + " RPM";
  document.getElementById("cpuTempFan").innerText =
    averageTemp.toFixed(0) + "°C";
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
buttonfanMax.addEventListener("mousedown", () => fanMax());

const buttonfanOff = document.getElementById("fanOff");
buttonfanOff.addEventListener("mousedown", () => fanOff());

const buttonfanAuto = document.getElementById("fanAuto");
buttonfanAuto.addEventListener("mousedown", () => fanAuto());

//system infopage
const selected = document.querySelector(".selected");

//sends info from ec to html
function getSystemInfo() {
  if (selected.innerText == "Boot Timestamps") {
    setTimeout(async () => {
      const cbmemdata = await invoke("get_cbmem");
      document.getElementById("cbMemInfo").innerText = cbmemdata;
    }, 1000);
  } else if (selected.innerText == "Coreboot Log") {
    setTimeout(async () => {
      const coreboot = await invoke("get_coreboot");
      document.getElementById("cbMemInfo").innerText = coreboot;
    }, 1000);
  } else if (selected.innerText == "Coreboot Extended Log") {
    setTimeout(async () => {
      const corebootlong = await invoke("get_coreboot_long");
      document.getElementById("cbMemInfo").innerText = corebootlong;
    }, 1000);
  } else if (selected.innerText == "EC Console Log") {
    setTimeout(async () => {
      const console = await invoke("get_ec_console");
      document.getElementById("cbMemInfo").innerText = console;
    }, 1000);
  } else if (selected.innerText == "Battery Info") {
    setTimeout(async () => {
      const battery = await invoke("get_battery");
      document.getElementById("cbMemInfo").innerText = battery;
    }, 1000);
  } else if (selected.innerText == "EC Chip Info") {
    setTimeout(async () => {
      const flashChip = await invoke("get_flash_chip");
      document.getElementById("cbMemInfo").innerText = flashChip;
    }, 1000);
  } else if (selected.innerText == "SPI Info") {
    setTimeout(async () => {
      const spi = await invoke("get_spi_info");
      document.getElementById("cbMemInfo").innerText = spi;
    }, 1000);
  } else if (selected.innerText == "EC Protocol Info") {
    setTimeout(async () => {
      const protocol = await invoke("get_ec_protocol");
      document.getElementById("cbMemInfo").innerText = protocol;
    }, 1000);
  } else if (selected.innerText == "Temp Sensor Info") {
    setTimeout(async () => {
      const temp_sensor = await invoke("get_temp_sensor");
      document.getElementById("cbMemInfo").innerText = temp_sensor;
    }, 1000);
  } else if (selected.innerText == "Power Delivery Info") {
    setTimeout(async () => {
      const power_delivery = await invoke("get_power_delivery");
      document.getElementById("cbMemInfo").innerText = power_delivery;
    }, 1000);
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
