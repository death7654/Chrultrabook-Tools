const exec = require("child_process").exec;

function setFanOff() {
  exec('"C:\\Program Files\\crosec\\ectool" fanduty 0',
    function fanSpeed(error, stdout) {
      return fanSpeed;
    });
}

module.exports = { setFanOff }





