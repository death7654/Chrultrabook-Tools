const exec = require("child_process").exec;

function setFanAuto() {
  exec('"C:\\Program Files\\crosec\\ectool" autofanctrl',
    function fanSpeed(error, stdout) {
      return fanSpeed;
    });
}

module.exports = { setFanAuto }





