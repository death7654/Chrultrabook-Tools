const exec = require("child_process").exec;
var child;

function getFanSpeed(){
    if (!mainWindow) return;
    child = exec('ectool pwmgetfanrpm',
      function fanSpeed(error, stdout) {
        const fanSpeedLong = stdout.toString();
        const fanSpeedWithSpaces = fanSpeedLong.substring(11, 15);
        const fanSpeed = fanSpeedWithSpaces.replace(/[^0-9]/g, '');
        mainWindow.webContents.send('fanSpeed',fanSpeed);
      
        //console.log(fanSpeed);
        return fanSpeed;
        
      });
    }
  
    module.exports = {getFanSpeed}
