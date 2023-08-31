const exec = require("child_process").exec;
var child;

function setFanSpeedMax(){
    child = exec('ectool fanduty 100',
      function fanSpeed(error, stdout) {
        return fanSpeed;
      });
    }

    module.exports = {setFanSpeedMax}





