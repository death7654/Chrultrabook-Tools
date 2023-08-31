const exec = require("child_process").exec;
var child;

function setev(){
    child = exec('set PATH=c:\\myBin;C:\\Program Files\\crosec');
    return;
    }

    module.exports = {setev}





