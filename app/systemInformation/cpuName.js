const exec = require("child_process").exec;
var child;

function cpuName(){
    child = exec('wmic cpu get name',
      function cpuName(error, stdout) {
        const cpuNamefull = stdout.toString();
        const nameCPU = cpuNamefull.substring(45,85);
        console.log(nameCPU);
        mainWindow.webContents.send('cpuName',nameCPU);
        return nameCPU;

      });
    }
  
    module.exports = {cpuName}
