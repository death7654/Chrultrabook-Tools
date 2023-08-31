import { exec } from "child_process";

function cbMem() {
  exec('"C:\\Program Files\\crosec\\cbmem"',
    function cbMem(error, stdout) {
      const cbMem = stdout.toString();
      mainWindow.webContents.send('cbMemInfo', cbMem);
      return cbMem;

    });
}

export default { cbMem }
