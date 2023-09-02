const exec = require("child_process").exec;
let child;

function cpuName(){
    child = exec('wmic cpu get name', (error, stdout) => {
        const cpuName = stdout.toString().split("\n")[1].trim();
        mainWindow.webContents.send('cpuName', cpuName);
        return cpuName;
    });
}
  
module.exports = {cpuName}
