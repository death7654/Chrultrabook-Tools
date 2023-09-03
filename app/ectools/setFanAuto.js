const exec = require("child_process").exec;
var child;

function setFanAuto(){
    child = exec('"C:\\Program Files\\crosec\\ectool" autofanctrl', (error, stdout) => {});
}

module.exports = {setFanAuto}





