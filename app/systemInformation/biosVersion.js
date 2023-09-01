const exec = require("child_process").exec;
var child;

function biosVersion(){
    child = exec('wmic bios get smbiosbiosversion',
      function biosVersion(error, stdout) {
        const biosVersionFull = stdout.toString();
        const biosVersion = biosVersionFull.substring(25, 44);
        //console.log(biosVersion);
        mainWindow.webContents.send('biosVersion',biosVersion);
        return biosVersion;

      });
    }
  
    module.exports = {biosVersion}
