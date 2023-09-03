const exec = require("child_process").exec;
var child;

function setFanSpeedMax(){
    child = exec('"C:\\Program Files\\crosec\\ectool" fanduty 100', (error, stdout) => {});
}

module.exports = {setFanSpeedMax}
