const exec = require("child_process").exec;
var child;

function setFanAuto(){
    child = exec('ectool autofanctrl',
      function fanSpeed(error, stdout) {
        return fanSpeed;
      });
    }

    module.exports = {setFanAuto}





