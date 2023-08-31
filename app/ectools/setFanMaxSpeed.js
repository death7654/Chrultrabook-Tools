const exec = require("child_process").exec;

function setFanSpeedMax() {
  exec('"C:\\Program Files\\crosec\\ectool" fanduty 100',
    function fanSpeed(error, stdout) {
      return fanSpeed;
    });
}

module.exports = { setFanSpeedMax }





