const exec = require("child_process").exec;

function cbMem() {
  exec('"C:\\Program Files\\crosec\\cbmem"',
    function cbMem(error, stdout) {
      const cbMem = stdout.toString();
      mainWindow.webContents.send('cbMemInfo', cbMem);
      return cbMem;

    });
}

module.exports = { cbMem }
