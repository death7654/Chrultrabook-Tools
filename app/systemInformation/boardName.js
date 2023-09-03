const exec = require("child_process").exec;
var child;

function boardname(){
    child = exec('wmic baseboard get Product', (error, stdout) => {
        const boardname = stdout.toString().split("\n")[1].trim();
        mainWindow.webContents.send('boardname',boardname);
        return boardname;
    });
}
  
module.exports = {boardname}
