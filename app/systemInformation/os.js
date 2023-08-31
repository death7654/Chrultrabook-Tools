const exec = require("child_process").exec;
var child;

function osName(){
    child = exec('systeminfo | findstr /B /C:"OS Name"',
      function osName(error, stdout) {
        const osNameFull = stdout.toString();
        const osName = osNameFull.substring(27, );
        //console.log(osName);
        mainWindow.webContents.send('OS',osName);
        return osName;

      });
    }
  
    module.exports = {osName}
