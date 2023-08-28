const exec = require("child_process").exec;
const electron = require('electron');
var child;

function setFanAuto(){
    child = exec('ectool autofanctrl',
      function fanSpeed(error, stdout) {
        return fanSpeed;
      });
    }

    module.exports = {setFanAuto}





