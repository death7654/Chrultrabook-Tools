
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const os2 = require('os-utils');
const temps = require('./app/Dashboard/ectool.js')
var cpuTemp;
app.whenReady().then(main);

let window;

async function main (){
  mainWindow = new BrowserWindow({
    icon: path.join (__dirname, "/Icons/app-icon.ico"),
    width: 800, //px
    height: 600, //px
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      sandbox: false,
      nodeIntegration: false,
      preload: path.join(__dirname, "./backend/systeminfo.js"),
      enableRemoteModule: false,
      contextIsolation: true,
    }
  })
  mainWindow.loadFile(path.join(__dirname, "app/dashboard/index.html"));
}

//update functions for index.html

setInterval(() => {
  os2.cpuUsage(function(v){
    mainWindow.webContents.send('cpu',v*100);
    mainWindow.webContents.send('mem',os2.freememPercentage()*100);
  })  
  temps.getTemps() // makes cpu temps work, a highly botched solution
},1000);



  