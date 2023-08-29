const exec = require("child_process").exec;
var child;

function getFanSpeed(){
    if (!mainWindow) return;
    child = exec('ectool pwmgetfanrpm',
      function fanSpeed(error, stdout) {
        const fanSpeedLong = stdout.toString();
        const fanSpeed = fanSpeedLong.substring(11, 15);
        mainWindow.webContents.send('fanSpeed',fanSpeed);
        //console.log(fanSpeed);
        return fanSpeed;
        
      });
    }
  
    module.exports = {getFanSpeed}
