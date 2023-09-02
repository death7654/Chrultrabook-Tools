const exec = require("child_process").exec;
var child;

//temps for cpu via ectools
function getTemps(){
    child = exec('"C:\\Program Files\\crosec\\ectool" temps all', (error, stdout) => {
        // Take the average? Not all chromebooks have a cpu temp sensor in the same place
        const cpuTempFunction = stdout.toString();
        let sensors = 0;
        let temps = 0;
        cpuTempFunction.split("\n").forEach(line => {
            const num = line.split("C)")[0].trim().split(" ").pop().trim();
            if (num && !isNaN(num)) {
                temps += parseFloat(num);
                sensors++;
            }
        })
        const averageTemp = temps / sensors;
        
        mainWindow.webContents.send('cpuTemp', averageTemp);
        mainWindow.webContents.send('cpuTempFan', averageTemp);
        return averageTemp;
    });
}
  
module.exports = {getTemps}
