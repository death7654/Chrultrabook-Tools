const electron = require('electron');
const contextBridge = electron.contextBridge;
const ipcRenderer = electron.ipcRenderer;



//index.html cpu load
ipcRenderer.on('cpu',(event,data) => {
    //console.log(data + " %");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('cpuLoad');
    if (element) element.innerText = data.toFixed(0) + "%";
});
//index.html memory usage
ipcRenderer.on('mem',(event, data) => {
    //console.log(data + " %");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('ramPercentage');
    if (element) element.innerText = 100 - data.toFixed(0)+ "%"
});
//index.html cpu temperatures
ipcRenderer.on('cpuTemp',(event,data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('cpuTemp');
    if (element) element.innerText = data + "°C";
});

ipcRenderer.on('fanSpeed',(event,data) => {
    //console.log(data + " C");
    const element = document.querySelector(".view_frame").contentDocument.getElementById('fanSpeed');
    if (element) element.innerText = data + " RPM";
});


contextBridge.exposeInMainWorld('electronAPI',{
  setFan: (mode) => ipcRenderer.send('setFan', mode)
})
