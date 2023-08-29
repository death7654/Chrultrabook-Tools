const exec = require("child_process").exec;
var fs = require('fs')
var child;

function cbMem(){
    child = exec('cbmem',
      function cbMem(error, stdout) {
        const cbMem = stdout.toString();
        mainWindow.webContents.send('cbMemInfo',cbMem);
        //console.log(cbMem);
        /*fs.writeFile("C:\\Users\\$(User)\\Downloads\\chromebooklog.txt", stdout.toString(), (err) => {
          if (!err) {
            console.log("written");
          }
          else {
            console.log(err);
          }
        })*/
        return cbMem;

      });
    }
  
    module.exports = {cbMem}
