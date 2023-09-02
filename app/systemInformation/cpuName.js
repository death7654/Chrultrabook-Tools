const exec = require("child_process").exec;
var child;

function cpuName(){
    child = exec('wmic cpu get name', (error, stdout) => {
        const cpuName = stdout.toString();
        mainWindow.webContents.send('cpuName', cpuName);
        return cpuName;
    });
}
  
module.exports = {cpuName}
