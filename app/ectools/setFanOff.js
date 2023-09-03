const exec = require("child_process").exec;
var child;

function setFanOff(){
    child = exec('"C:\\Program Files\\crosec\\ectool" fanduty 0', (error, stdout) => {});
}

module.exports = {setFanOff}
