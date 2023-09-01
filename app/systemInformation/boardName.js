const exec = require("child_process").exec;

function boardname() {
  exec('wmic baseboard get Product',
    function boardname(error, stdout) {
      const boardnameFull = stdout.toString();
      const boardname = boardnameFull.substring(12, 22);
      //console.log(boardname);
      mainWindow.webContents.send('boardname', boardname);
      return boardname;

    });
}

module.exports = { boardname }
