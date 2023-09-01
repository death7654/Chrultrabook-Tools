const exec = require("child_process").exec;

function hostname() {
  exec('hostname',
    function hostname(error, stdout) {
      const hostname = stdout.toString();
      //console.log(hostname);
      mainWindow.webContents.send('hostname', hostname);
      return hostname;

    });
}

module.exports = { hostname }
