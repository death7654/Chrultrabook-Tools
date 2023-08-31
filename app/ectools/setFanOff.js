const exec = require("child_process").exec;
var child;

function setFanOff(){
    child = exec('ectool fanduty 0',
      function fanSpeed(error, stdout) {
        return fanSpeed;
      });
    }

    module.exports = {setFanOff}





