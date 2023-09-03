const electron = require('electron');
const contextBridge = electron.contextBridge;
const ipcRenderer = electron.ipcRenderer;



//index.html cpu load
ipcRenderer.on('cpu',(event,data) => {
    //console.log(data + " %");
    document.getElementById('cpuLoad').innerText = data.toFixed(0) + "%";
});
//index.html memory usage
ipcRenderer.on('mem',(event, data) => {
    //console.log(data + " %");
    document.getElementById('ramPercentage').innerText = 100 - data.toFixed(0)+ "%"
});
//index.html cpu temperatures
ipcRenderer.on('cpuTemp',(event,data) => {
    //console.log(data + " C");
    document.getElementById('cpuTemp').innerText = data.toFixed(0) + "°C";
});
ipcRenderer.on('cpuTempFan',(event,data) => {
    //console.log(data + " C");
    document.getElementById('cpuTempFan').innerText = data.toFixed(0) + "°C";
});

ipcRenderer.on('fanSpeed',(event,data) => {
    //console.log(data + " C");
    document.getElementById('fanSpeed').innerText = data + " RPM";
});

ipcRenderer.on('cbMemInfo',(event,data) => {
    //console.log(data + " C");
    document.getElementById('cbMemInfo').innerText = data;
});
ipcRenderer.on('cpuName',(event,data) => {
    //console.log(data + " C");
    document.getElementById('cpuName').innerText = "CPU: " + data;
});
ipcRenderer.on('hostname',(event,data) => {
    //console.log(data + " C");
    document.getElementById('hostname').innerText = "Hostname: " + data;
});
ipcRenderer.on('coreCPU',(event,data) => {
    //console.log(data + " C");
    document.getElementById('coreCPU').innerText = "Cores: " + data + " Cores";
});
ipcRenderer.on('boardname',(event,data) => {
    //console.log(data + " C");
    document.getElementById('boardname').innerText = "Boardname: " + data;
});
ipcRenderer.on('OS',(event,data) => {
    //console.log(data + " C");
    document.getElementById('OS').innerText = "OS: " + data;
});
ipcRenderer.on('biosVersion',(event,data) => {
    //console.log(data + " C");
    document.getElementById('biosVersion').innerText = "Bios Version: " + data;
});



contextBridge.exposeInMainWorld('electronAPI',{
  ectool: (mode) => ipcRenderer.send('ectool', mode),
  requestData: () => ipcRenderer.send('requestData'),
  openExternal: (url) => ipcRenderer.send("openExternal", url),
  requestSystemInfo: () => ipcRenderer.send("requestSystemInfo")
})
