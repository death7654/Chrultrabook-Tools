const exec = require("child_process").exec;
var child;

function coreCPU() {
    child = exec('wmic cpu get numberOfLogicalProcessors', (error, stdout) => {
        const coreCPU = stdout.toString().split("\n")[1].trim();
        mainWindow.webContents.send('coreCPU', coreCPU);
        return coreCPU;
    });
}

module.exports = {coreCPU}
