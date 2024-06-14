# Chrultrabook Tools
<img src="https://img.shields.io/github/downloads/Death7654/Chrultrabook-Controller/total" alt="shields">&nbsp;&nbsp;
<img src="https://img.shields.io/github/contributors/Death7654/Chrultrabook-Controller?color=dark-green" alt="shields">&nbsp;&nbsp;
<img src="https://img.shields.io/github/forks/Death7654/Chrultrabook-Controller?style=social" alt="shields">&nbsp;&nbsp;
<img src="https://img.shields.io/github/stars/Death7654/Chrultrabook-Controller?style=social" alt="shields">
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/death7654/Chrultrabook-Tools/wiki/Installing)

Control your Chrultrabook's hardware your way

## Features
- CPU Temperature
- Fan RPMs
- Custom Fan Curves
- Start Custom Fan Curves On System Startup
- Keyboard Brightness
- Change the Activity Light color on supported chromebooks
- System Diagnostics

## Screenshots

//to be added later

## Prerequisites

### Windows
- Install Coolstar's Latest CROSEC driver from [https://github.com/coolstar/driverinstallers/tree/master/crosec](https://github.com/coolstar/driverinstallers/tree/master/crosec)
- Download the MSI or EXE from the latest [release](https://github.com/death7654/Chrultrabook-Tools/releases)
- Run the Installer

### Linux
- Download [ectool](https://tree123.org/files/utils/ectool) and [cbmem](https://tree123.org/files/utils/cbmem) binaries
- Move the binaries to a safe location
- ```cd``` to the directory in terminal
- Mark the binaries as an executeable ```sudo chmod a + x ectool && sudo chmod a + x cbmem```
- Download the AppImage from the latest [release](https://github.com/death7654/Chrultrabook-Tools/releases)
- Mark the AppImage as an executeable ```chmod a+x chrultrabook-controller_3.0.1_amd64.AppImage```

### macOS
- Download the [ectool](https://ethanthesleepy.one/public/chrultrabook/utils/) binary
- ```cd``` to the directory in which the binary is located
- Copy the file to the correct directory ```sudo cp ./ectool /usr/local/bin/ectool```
- Mark the binary as an executeable ```sudo chmod +x /usr/local/bin/ectool```
- Download the DMG from the latest [release](https://github.com/death7654/Chrultrabook-Tools/releases)
- Run the installer

## Built Using
- Tauri
- Angular
- Rust
- HTML5
- CSS
- TS

## Authors

👤 **Robinson Arysseril, Ingo Reitz**

* GitHub: [@death7654](https://github.com/death7654)
* Github: [@ninelore](https://github.com/ninelore)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/death7654/Chrultrabook-Tools/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc). 
You can also take a look at the [contributing guide](https://github.com/death7654/Chrultrabook-Tools/wiki/Contributing).
If you have any features you would like to see look at [feature requests](https://github.com/death7654/Chrultrabook-Tools/discussions)

## Show your support

Give a ⭐️ if this project helped you!


## 📝 License

This project is [GPL-3.0](https://github.com/death7654/Chrultrabook-Tools/blob/3.X.X/LICENSE) licensed.

## Disclaimer
THE SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. MISUSE OF THIS SOFTWARE COULD CAUSE SYSTEM INSTABILITY OR MALFUNCTION.
