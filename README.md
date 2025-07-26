# Chrultrabook Tools

<img src="https://img.shields.io/github/downloads/Death7654/Chrultrabook-Controller/total" alt="shields">&nbsp;&nbsp;
<img src="https://img.shields.io/github/forks/Death7654/Chrultrabook-Controller?style=social" alt="shields">&nbsp;&nbsp;
<img src="https://img.shields.io/github/stars/Death7654/Chrultrabook-Controller?style=social" alt="shields">

### Your Chrultrabook, Your Way

![image(2)](https://github.com/death7654/Chrultrabook-Tools/assets/72635727/1d5633e3-8b1e-4d0e-a3ba-096ed05675aa)

## Features

- CPU Temperature
- Fan Speed Monitoring
- Custom Fan Curves
- Custom Fan Profiles
- Fan Speed Graph
- Custom Fan Profiles
- CPU Temperature Graph
- Start Application in System Tray
- Start Application on System Boot
- Start Custom Fan Profiles on System Boot
- Change Keyboard Brightness
- Change Activity Light Colors (on select Chromebooks)
- System Diagnostics
- Keyboard Backlight
  

## Install Instructions

### Windows

- Install Coolstar's latest CROS-EC driver from [https://github.com/coolstar/driverinstallers/tree/master/crosec](https://github.com/coolstar/driverinstallers/tree/master/crosec)
- Download the MSI or EXE from the latest [release](https://github.com/death7654/Chrultrabook-Tools/releases)
- Run the installer
- Open the application

#### Windows 11 24H2 and newer
- Enable WMIC
   - Open Settings
   - Navigate to `Optional Features`
   - Click `View Features`
   - Search and add `WMIC`
   - Reopen the application

### Linux

#### Fedora/RHEL and derivatives

Add the Terra repository (if using Ultramarine Linux, Terra is pre-installed). Instructions can be found [here](https://github.com/terrapkg/packages/blob/frawhide/README.md).

Install Chrultrabook-Tools:

```
dnf install chrultrabook-tools
```

#### Debian and derivatives

Add the Chrultrabook-Tools repository:

xxx

Install Chrultrabook-Tools:

```
apt install chultrabook-tools
```

#### Arch and derivatives

Download the Arch package from the Releases page, then install:

pacman -U ~/Downloads/Chrultrabook-Tools-VERSION-pkg.tar.zst

#### Compiled binary
- You must start the application as root as the ectool binary requires sudo privileges 

### macOS

- Download the [ectool](https://github.com/1Revenger1/ectool) binary
- Move the binary to `/usr/bin` or `/usr/local/bin`
- Download the installer with  `x86_64` in its name
- Run the Chrultrabook Tools Installer
- Drag the Chrultrabook Tools app into the Applications Folder
- Open the app

## Built Using

- Tauri 2.0
- Angular 19
- Rust 1.83
- HTML5
- CSS
- TS

## Authors

👤 **Robinson Arysseril**

- GitHub: [@death7654](https://github.com/death7654)

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
