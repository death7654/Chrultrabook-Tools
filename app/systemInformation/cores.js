const exec = require("child_process").exec;

function coreCPU() {
  exec('wmic cpu get numberOfLogicalProcessors',
    function coreCPU(error, stdout) {
      const coreCPUFull = stdout.toString();
      const coreCPU = coreCPUFull.substring(30, 32);
      //console.log(coreCPU);
      mainWindow.webContents.send('coreCPU', coreCPU);
      return coreCPU;

    });
}

module.exports = { coreCPU }
