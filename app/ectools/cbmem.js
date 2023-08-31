const exec = require("child_process").exec;
var child;

function cbMem(){
    child = exec('cbmem',
      function cbMem(error, stdout) {
        const cbMem = stdout.toString();
        mainWindow.webContents.send('cbMemInfo',cbMem);
        return cbMem;

      });
    }
  
    module.exports = {cbMem}
