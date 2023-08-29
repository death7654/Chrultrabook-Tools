const { app, BrowserWindow, ipcMain, contextBridge } = require('electron');
const path = require('path');
const os = require('os');
const os2 = require('os-utils');
const temps = require('./app/ectools/cpuTemp.js');
const fanSpeed = require('./app/ectools/fanRPM.js');
const fanMax = require('./app/ectools/setFanMaxSpeed.js');
const fanAuto = require('./app/ectools/setFanAuto.js');
const fanOff = require('./app/ectools/setFanOff.js');

app.whenReady().then(() => {
  ipcMain.on('sentcommand', handleSetTitle)
})

global.mainWindow = null;

function handleSetTitle (event, title) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
}

function createWindow(){
  global.mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "/app/Icons/app-icon.ico"),
    width: 800, //px
    height: 600, //px
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      sandbox: false,
      nodeIntegration: true,
      preload: path.join(__dirname, "./backend/preload.js"),
      enableRemoteModule: false,
      contextIsolation: true,
    }
  })
  mainWindow.loadFile(path.join(__dirname, "app/index.html"));
}
app.on('ready', createWindow);
app.on('window-all-closed', function() {
    app.quit();
})

//update functions for index.html

function sendData() {
    if (!mainWindow) return;
    os2.cpuUsage(function(v){
        mainWindow.webContents.send('cpu',v*100);
        mainWindow.webContents.send('mem',os2.freememPercentage()*100);
    })  
    temps.getTemps(); // makes cpu temps work, a highly botched solution
    fanSpeed.getFanSpeed();
}

setInterval(sendData, 1000);

ipcMain.on('setFan', (event, mode) => {
    //console.log('recieved');
    if (mode === 1)  {
        fanMax.setFanSpeedMax();
        //console.log(mode);
    }
    else if (mode === 2) {
        fanOff.setFanOff();
        //console.log(mode);
    } else if (mode === 3) {
    fanAuto.setFanAuto();
    //console.log(mode);
    }
});

ipcMain.on('requestData', (e) => {
    //new iframe loading...
    sendData();
})
