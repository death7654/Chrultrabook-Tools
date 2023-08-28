const exec = require("child_process").exec;
const electron = require('electron');
var child;

function setFanSpeedMax(){
    child = exec('ectool fanduty 100',
      function fanSpeed(error, stdout) {
        return fanSpeed;
      });
    }

    module.exports = {setFanSpeedMax}





