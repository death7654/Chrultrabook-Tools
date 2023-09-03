const exec = require("child_process").exec;
var child;

function getFanSpeed(){
    child = exec('"C:\\Program Files\\crosec\\ectool" pwmgetfanrpm', (error, stdout) => {
        const fanSpeed = stdout.toString().split(":").pop().trim();
        mainWindow.webContents.send('fanSpeed',fanSpeed);
      
        //console.log(fanSpeed);
        return fanSpeed;
    });
}

module.exports = {getFanSpeed}
