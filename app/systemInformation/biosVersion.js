const exec = require("child_process").exec;
let child;

function biosVersion() {
    child = exec('wmic bios get smbiosbiosversion', (error, stdout) => {
        const biosVersion = stdout.toString().split("\n")[1].trim();
        mainWindow.webContents.send('biosVersion',biosVersion);
        return biosVersion;
    });
}
  
module.exports = {biosVersion}
