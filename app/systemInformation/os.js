const exec = require("child_process").exec;
let child;

function osName(){
    child = exec('systeminfo | findstr /B /C:"OS Name"', (error, stdout) => {
        const osName = stdout.toString().substring(8).trim();
        //console.log(osName);
        mainWindow.webContents.send('OS',osName);
        return osName;
    });
}
  
module.exports = {osName}
