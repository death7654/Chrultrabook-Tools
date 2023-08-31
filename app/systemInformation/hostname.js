const exec = require("child_process").exec;
var child;

function hostname(){
    child = exec('hostname',
      function hostname(error, stdout) {
        const hostname = stdout.toString();
        //console.log(hostname);
        mainWindow.webContents.send('hostname',hostname);
        return hostname;

      });
    }
  
    module.exports = {hostname}
