import { contextBridge as _contextBridge, ipcRenderer as _ipcRenderer } from 'electron';
const contextBridge = _contextBridge;
const ipcRenderer = _ipcRenderer;



//index.html cpu load
ipcRenderer.on('cpu', (event, data) => {
    //console.log(data + " %");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('cpuLoad');
    if (element) element.innerText = data.toFixed(0) + "%";
});
//index.html memory usage
ipcRenderer.on('mem', (event, data) => {
    //console.log(data + " %");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('ramPercentage');
    if (element) element.innerText = 100 - data.toFixed(0) + "%"
});
//index.html cpu temperatures
ipcRenderer.on('cpuTemp', (event, data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('cpuTemp');
    if (element) element.innerText = data + "°C";
});

ipcRenderer.on('fanSpeed', (event, data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('fanSpeed');
    if (element) element.innerText = data + " RPM";
});

ipcRenderer.on('cbMemInfo', (event, data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('cbMemInfo');
    if (element) element.innerText = data;
});
ipcRenderer.on('cpuName',(event,data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('cpuName');
    if (element) element.innerText = "CPU: " + data;
});
ipcRenderer.on('hostname',(event,data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('hostname');
    if (element) element.innerText = "Hostname: " + data;
});
ipcRenderer.on('coreCPU',(event,data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('coreCPU');
    if (element) element.innerText = "Cores: " + data;
});
ipcRenderer.on('boardname',(event,data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('boardname');
    if (element) element.innerText = "Boardname: " + data;
});
ipcRenderer.on('OS',(event,data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('OS');
    if (element) element.innerText = "OS: " + data;
});
ipcRenderer.on('biosVersion',(event,data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('biosVersion');
    if (element) element.innerText = "Bios Version: " + data;
});



contextBridge.exposeInMainWorld('electronAPI', {
    ectool: (mode) => ipcRenderer.send('ectool', mode),
    requestData: () => ipcRenderer.send('requestData')
})
