const exec = require("child_process").exec;
var child;

//temps for cpu via ectools
function getTemps(){
    if (!mainWindow) return;
    child = exec('ectool temps 2',
      function tempCPU(error, stdout) {
        const cpuTempFunction = stdout.toString();
        const cpuTempFunctionSpecfic = cpuTempFunction.substring(131, 134);
        mainWindow.webContents.send('cpuTemp',cpuTempFunctionSpecfic);
        //console.log(cpuTempFunctionSpecfic);
        //global.mainWindow.webContents.send('cpuTemp',cpuTempFunctionSpecfic);
        //console.log(cpuTempFunctionSpecfic);
        return cpuTempFunctionSpecfic;
        
      });
    }
  
    module.exports = {getTemps}



  
