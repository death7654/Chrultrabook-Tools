import {appWindow} from "@tauri-apps/api/window";
import {invoke} from "@tauri-apps/api/tauri";
import {disable, enable} from "tauri-plugin-autostart-api";
import {Chart, ChartConfiguration, ChartData, ChartTypeRegistry, registerables} from "chart.js";
import "chartjs-plugin-dragdata";
import "./styles.css";

Chart.register(...registerables);

//TODO: General consistency between document.querySelector and .getElementById
//TODO: Order in this file

const startupFan = document.querySelector<HTMLInputElement>("startupFansInput")!;
const systemTray = document.querySelector<HTMLInputElement>("systemTrayInput")!;
const startHidden = document.querySelector<HTMLInputElement>("startHiddenInput")!;
const startOnBoot = document.querySelector<HTMLInputElement>("startOnBootInput")!;

//prevents right click
document.addEventListener("contextmenu", (event) => event.preventDefault());

//checks what os the user is on
let is_windows: boolean = await invoke("is_windows");

//hides things currently incompatible with linux and macOS
if (!is_windows) {
    document.querySelectorAll<HTMLElement>('#startOnBoot, #startHidden, #startOnBootButton, #startHiddenButton')
        .forEach(_ => _.style.display = "none");
}

//start Hidden
const hideOnStart = localStorage.getItem("startHidden");
if (hideOnStart === "yes") {
    //closes splash screen
    invoke("close_splashscreen");
    appWindow.hide();
    startHidden.checked = true;
}

//app close and open functions
document.getElementById("close")!.addEventListener("mousedown", () => {
    if (localStorage.getItem("quitToTray") === "yes") {
        appWindow.hide();
        systemTray.checked = true; //TODO: Error: unresolved
    } else {
        appWindow.close();
    }
});

document.getElementById("minimize")!
    .addEventListener("mousedown", () => appWindow.minimize());

//function to check if a number exist
function containsNumber(str: any) {
    return /\d/.test(str);
}

//checks if fan exists
const fanExist: boolean = containsNumber(await invoke("get_fan_rpm"));
if (!fanExist) {
    document.getElementById("fan")!.style.display = "none";
}

//sets current percentage for backlight and hides the slider if the chromebook has no backlight or battery controls
setTimeout(async () => {
    let keyboardBackLight: string = await invoke("ectool", {
        value: "pwmgetkblight",
        value2: "",
    });
    let value = keyboardBackLight.split(" ");
    document.querySelector<HTMLInputElement>('#backlightRangeSlider')!.value = value[4];
    if (!containsNumber(value[4])) {
        document.getElementById("rangeBacklight")!.style.display = "none";
        document.querySelector<HTMLInputElement>('#backlightRangeSlider')!.style.display = "none";
    }

    //prevents laptops with no backlight form seeing this
    if (value[4] !== "0") {
        document.getElementById("backlightRangeSliderText")!.innerText = value[4];
    } else {
        document.getElementById("backlightRangeSliderText")!.innerText = "off";
    }
}, 0);

//homepage
let averageTemp: number;
setInterval(async () => {
    const ramUsage = await invoke("get_ram_usage");
    const cpuUsage = await invoke("get_cpu_usage");
    document.getElementById("ramPercentage")!.innerText = ramUsage + "%";
    document.getElementById("cpuLoad")!.innerText = cpuUsage + "%";

    //cpu temps
    const cpuTempFunction: string = await invoke("get_cpu_temp");
    let sensors = 0;
    let temps = 0;
    cpuTempFunction.split("\n").forEach((line) => {
        const num = line.split("C)")[0].trim().split(" ").pop();
        if (num && !Number.isNaN(num)) {
            temps += parseFloat(num.trim());
            sensors++;
        }
    });
    averageTemp = temps / sensors;
    document.getElementById("cpuTemp")!.innerText = averageTemp.toFixed(0) + "°C";
    document.getElementById("cpuTempFan")!.innerText =
        averageTemp.toFixed(0) + "°C";
}, 1000);

//only allows fanRPM, and fanTEMPS to execute if a fan is found
if (fanExist) {
    setInterval(async () => {
        const fanRPM: string = await invoke("get_fan_rpm");
        const fanSpeed = fanRPM.split(":").pop()!.trim();
        document.getElementById("fanSpeed")!.innerText = fanSpeed + " RPM";
    }, 1000);

    //loads chart on startup
    setTimeout(async () => {
        let fanCurve = localStorage.getItem("customfanCurves");
        if (fanCurve) {
            myChart.config.data.datasets[0].data = JSON.parse(fanCurve);
        } else {
            //adds chart for new installs/users
            myChart.config.data.datasets[0].data = [0, 0, 50, 90, 100, 100, 100];
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
    document.getElementById("biosVersion")!.innerText = "Bios Version: " + bios;
    document.getElementById("boardname")!.innerText = "Boardname: " + boardname;
    document.getElementById("coreCPU")!.innerText = "Cores: " + cores + " Cores";
    document.getElementById("hostname")!.innerText = "Hostname: " + hostname;
    document.getElementById("cpuName")!.innerText = "CPU: " + cpuname;
}, 0);

//setFanSpeeds
//Draggable Fan Chart
const data: any = {
    labels: ["35°C", "40°C", "45°C", "50°C", "55°C", "60°C"],
    datasets: [
        {
            label: "Fan Speed",
            //The 7th value is to keep the chart from lowering to 1
            data: [0, 0, 50, 90, 100, 100, 100],
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
const config: any = {
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
                onDragStart: () => {
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
const myChart = new Chart(document.querySelector<HTMLCanvasElement>("#fancurves")!, config);

myChart.update();

let autoFan = document.getElementById("fanAuto")!;
let offFan = document.getElementById("fanOff")!;
let maxFan = document.getElementById("fanMax")!;
let setFan = document.getElementById("setFan")!;

function setTemps() {
    //built in protections for cpuTemps
    //TODO: Dont hardcode these
    if (averageTemp <= 35) {
        invoke("ectool", {value: "fanduty", value2: "0"});
        return;
    }
    if (averageTemp >= 60) {
        invoke("ectool", {value: "fanduty", value2: "100"});
        return;
    }
    //calculator for what speed (in percentage) to run the fans at
    let base = averageTemp - 35;
    const percentage = [1, 0.2, 0.4, 0.6, 0.8][base % 5];
    let index = (base - (base % 5)) / 5;
    let temp = myChart.data.datasets[0].data[index] as number;
    index++;
    let temp2 = myChart.data.datasets[0].data[index] as number;

    let tempBetween: any;
    if (averageTemp % 5 === 0) {
        index--;
        //prevents fans from using the next index and makes sure it doesnt calculate anything
        tempBetween = myChart.data.datasets[0].data[index];
    } else {
        tempBetween = (temp2 - temp) * percentage + temp;
    }
    invoke("ectool", {value: "fanduty", value2: tempBetween.toString()});
}

let clearCustomFan: number;

//starts fans if avaliable
const fanOnStart = localStorage.getItem("fanOnStart");
if (fanOnStart === "yes") {
    //startupFansInput.checked = true; //TODO: Error symbol doesnt exist
    clearCustomFan = setInterval(async () => {
        setTemps();
    }, 2000);
}

//sets customFanCurves
function customFan() {
    autoFan.classList.remove("activeButton");
    offFan.classList.remove("activeButton");
    maxFan.classList.remove("activeButton");
    setFan.classList.add("activeButton");
    clearInterval(clearCustomFan);
    clearCustomFan = setInterval(async () => {
        setTemps();
    }, 2000);
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
    clearInterval(clearCustomFan);

    //changes chart and uses built in protections for the fan
    myChart.config.data.datasets[0].data = [100, 100, 100, 100, 100, 100, 100];
    myChart.update();
    clearCustomFan = setInterval(async () => {
        setTemps();
    }, 2000);
}

//turns fan off
function fanOff() {
    invoke("ectool", {value: "fanduty", value2: "0"});
    autoFan.classList.remove("activeButton");
    offFan.classList.add("activeButton");
    maxFan.classList.remove("activeButton");
    setFan.classList.remove("activeButton");
    clearInterval(clearCustomFan);

    //changes chart and uses built in protections for the fan
    myChart.config.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 100];
    myChart.update();
    clearCustomFan = setInterval(async () => {
        setTemps();
    }, 2000);
}

//sets fan to the best fan curves
function fanAuto() {
    invoke("ectool", {value: "autofanctrl", value2: ""});
    autoFan.classList.add("activeButton");
    offFan.classList.remove("activeButton");
    maxFan.classList.remove("activeButton");
    setFan.classList.remove("activeButton");
    clearInterval(clearCustomFan);

    //changes chart and uses built in protections for the fan (better fan curves than ectools)
    myChart.config.data.datasets[0].data = [0, 0, 50, 90, 100, 100, 100];
    myChart.update();
    clearCustomFan = setInterval(async () => {
        setTemps();
    }, 2000);
}

//assigns each button to each fan function
const buttonfanMax = document.getElementById("fanMax")!;
buttonfanMax.addEventListener("mousedown", () => fanMax());

const buttonfanOff = document.getElementById("fanOff")!;
buttonfanOff.addEventListener("mousedown", () => fanOff());

const buttonfanAuto = document.getElementById("fanAuto")!;
buttonfanAuto.addEventListener("mousedown", () => fanAuto());

const buttonCustomFan = document.getElementById("setFan")!;
buttonCustomFan.addEventListener("mousedown", () => customFan());

//system infopage

//keyboard backlight slider
let sliderBacklight = document.querySelector<HTMLInputElement>('#backlightRangeSlider')!;
let outputBacklight = document.getElementById("backlightRangeSliderText")!;
outputBacklight.innerHTML = sliderBacklight.value;

//sends in from from html to ec and changes keyboard remap opacity
sliderBacklight.oninput = function (this) {
    outputBacklight.innerText = sliderBacklight.value === "0" ? "off" : sliderBacklight.value;
    invoke("ectool", {value: "pwmsetkblight", value2: sliderBacklight.value});
    document.getElementById("key")!.style.filter =
        parseInt(sliderBacklight.value) < 25 || sliderBacklight.value === "0"
            ? "opacity(25%)"
            : "opacity(" + sliderBacklight.value + "%)";
};

//batteryControl
let chargerSlider = document.querySelector<HTMLInputElement>('#chargerSlider')!;
let chargerOutputBacklight = document.getElementById("chargerSliderText")!;
chargerOutputBacklight.innerHTML = chargerSlider.value;
chargerSlider.oninput = function () {
    chargerOutputBacklight.innerText = chargerSlider.value;
};

function setChargeControl() {
    let upperLimit: number = parseInt(chargerSlider.value);
    let lowerLimit: number = upperLimit - 5;
    invoke("set_battery_limit", {value: lowerLimit, value2: upperLimit});
}

function setDefault() {
    invoke("set_battery_limit", {value: "", value2: ""});
}

document
    .getElementById("chargeControlSet")!
    .addEventListener("mousedown", () => setChargeControl());

document
    .getElementById("chargeControlDefault")!
    .addEventListener("mousedown", () => setDefault());

//sends info from html to ec, and pulls ec and sends it to HTML (system diagnostics)
const selected = document.querySelector<HTMLElement>(".selected")!;

async function getSystemInfo() {
    switch (selected.innerText) {
        case "Boot Timestamps":
            document.getElementById("cbMemInfo")!.innerText = await invoke("cbmem", {
                value: "-t",
            });
            break;
        case "Coreboot Log":
            document.getElementById("cbMemInfo")!.innerText = await invoke("cbmem", {
                value: "-c1",
            });
            break;
        case "Coreboot Extended Log":
            document.getElementById("cbMemInfo")!.innerText = await invoke("cbmem", {
                value: "-c",
            });
            break;
        case "EC Console Log":
            document.getElementById("cbMemInfo")!.innerText = await invoke("ectool", {
                value: "console",
                value2: "",
            });
            break;
        case "Battery Info":
            document.getElementById("cbMemInfo")!.innerText = await invoke("ectool", {
                value: "battery",
                value2: "",
            });
            break;
        case "EC Chip Info":
            document.getElementById("cbMemInfo")!.innerText = await invoke("ectool", {
                value: "chipinfo",
                value2: "",
            });
            break;
        case "SPI Info":
            document.getElementById("cbMemInfo")!.innerText = await invoke("ectool", {
                value: "flashspiinfo",
                value2: "",
            });
            break;
        case "EC Protocol Info":
            document.getElementById("cbMemInfo")!.innerText = await invoke("ectool", {
                value: "protoinfo",
                value2: "",
            });
            break;
        case "Temp Sensor Info":
            document.getElementById("cbMemInfo")!.innerText = await invoke("ectool", {
                value: "tempsinfo",
                value2: "all",
            });
            break;
        case "Power Delivery Info":
            document.getElementById("cbMemInfo")!.innerText = await invoke("ectool", {
                value: "pdlog",
                value2: "",
            });
            break;
        default:
            document.getElementById("cbMemInfo")!.innerText = "Select Something";
    }
}

//copy functions
const buttoncbMem = document.getElementById("cbMem")!;
buttoncbMem.addEventListener("mousedown", () => getSystemInfo());

//TODO: There has to be a better way...
function copyTxt(htmlElement: HTMLElement) {
    if (!htmlElement) return;

    let elementText = htmlElement.innerText;

    let inputElement = document.createElement("input");
    inputElement.setAttribute("value", elementText);
    document.body.appendChild(inputElement);
    inputElement.select();
    document.execCommand("copy"); //TODO: deprecated
    inputElement.parentElement!.removeChild(inputElement);
}

document.querySelector<HTMLElement>("#copyButton")!.addEventListener("mousedown", () => {
    copyTxt(document.querySelector<HTMLElement>("#cbMemInfo")!);
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

if ((is_windows = true)) {
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
    const onBoot = localStorage.getItem("startOnBoot");
    if (onBoot === "yes") {
        startOnBoot.checked = true;
    }
}
