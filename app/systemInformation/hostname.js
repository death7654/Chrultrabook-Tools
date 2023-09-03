const exec = require("child_process").exec;
let child;

function hostname(){
    child = exec('hostname', (error, stdout) => {
        const hostname = stdout.toString().trim();
        //console.log(hostname);
        mainWindow.webContents.send('hostname', hostname);
        return hostname;
    });
}
  
module.exports = {hostname}
