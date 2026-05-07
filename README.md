# Chrultrabook Tools

<img src="https://img.shields.io/github/downloads/Death7654/Chrultrabook-Controller/total" alt="shields">&nbsp;&nbsp;
<img src="https://img.shields.io/github/forks/Death7654/Chrultrabook-Controller?style=social" alt="shields">&nbsp;&nbsp;
<img src="https://img.shields.io/github/stars/Death7654/Chrultrabook-Controller?style=social" alt="shields">

---

## Your Chrultrabook, Your Way

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7b4f3899-e3e8-45b4-ab0d-bc23b0cdf82b" />

---

## Features

- CPU Temperature Monitoring
- CPU Temperature Graph
- Keyboard Remap (Windows)
- RGB Keyboard Controls
- Fan Speed Monitoring
- Custom Fan Curves
- Custom Fan Profiles
- Fan Speed Graph
- Start Application in System Tray
- Start Application on System Boot
- Start Custom Fan Profiles on System Boot
- Start Custom RGB Profile on System Boot
- Create Custom RGB Profiles
- Change Keyboard Brightness
- Change Activity Light Colors (on select Chromebooks)
- System Diagnostics

---

## Install Instructions

### Linux

---

### Fedora and Derivatives

Add the Terra repository (if using Ultramarine Linux or Nobara, Terra is pre-installed).  
Instructions can be found [here](https://github.com/terrapkg/packages/blob/frawhide/README.md)

Install Chrultrabook-Tools:
```
dnf install chrultrabook-tools
```
Reboot your chromebook

---

### Debian and Derivatives

#### Add the Chrultrabook Repository

1. Download and save the repository signing key:
```
sudo wget https://chrultrabook.sakamoto.pl/repos/debian/chrultrabook-debian-pub.asc -O /etc/apt/trusted.gpg.d/chrultrabook-debian-archive-keyring.asc
```
2. Download the source file to sources.list.d:
```
sudo wget https://chrultrabook.sakamoto.pl/repos/debian/chrultrabook.sources -O /etc/apt/sources.list.d/chrultrabook.sources
```
3. Update package lists:
```
sudo apt-get update
```
#### Install ectool and cbmem
```
sudo apt-get install cbmem chromium-ectool
```
#### Install Chrultrabook-Tools

1. cd to the directory containing the .deb file  
2. Run the following command with the correct version:
```
sudo apt install ./chrultrabook-tools_3.1.3_amd64.deb
```
Reboot your chromebook

---

### Arch and Derivatives

Install AUR dependencies (example uses [paru](https://github.com/Morganamilo/paru)):
```
paru -S chromium-ectool cbmem
```
Download the Arch package from the Releases page, then install:
```
pacman -U ~/Downloads/chrultrabook-tools-VERSION-pkg.tar.zst
```
Replace VERSION with the latest version and adjust the file path if needed.
After install reboot your chromebook 
---


### Build from Source
```
git clone https://github.com/death7654/Chrultrabook-Tools.git
cd Chrultrabook-Tools
npm install
npm run tauri build
```
---

## Windows

- Install Coolstar’s latest CROS-EC [driver](https://github.com/coolstar/driverinstallers/tree/master/crosec)
- Download the MSI or EXE from the latest [release](https://github.com/death7654/Chrultrabook-Tools/releases)
- Run the installer
- Open the application

### Windows 11 24H2 and Newer

Enable WMIC:

1. Open Settings
2. Navigate to Optional Features
3. Click View Features
4. Search for and add WMIC
5. Reopen the application

---

## macOS

- Download the ectool [binary](https://github.com/1Revenger1/ectool)
- Move the binary to /usr/bin or /usr/local/bin
- Download the installer with x86_64 in its name
- Run the Chrultrabook Tools Installer
- Drag the Chrultrabook Tools app into the Applications folder
- Open the app

---

## Built Using

- Tauri 2.9.5
- Angular 21
- Rust 1.92
- HTML5
- CSS
- TypeScript

---

## Authors

👤 **Robinson Arysseril**

- GitHub: https://github.com/death7654

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

[Issues page](https://github.com/death7654/Chrultrabook-Tools/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)  

[Contributing guide](https://github.com/death7654/Chrultrabook-Tools/wiki/Contributing)

[Feature requests](https://github.com/death7654/Chrultrabook-Tools/discussions)

---

## Show Your Support

Give a ⭐️ if this project helped you!

---

## 📝 License

This project is licensed under GPL-3.0:  
https://github.com/death7654/Chrultrabook-Tools/blob/3.X.X/LICENSE

---

## Disclaimer

THE SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. MISUSE OF THIS SOFTWARE COULD CAUSE SYSTEM INSTABILITY OR MALFUNCTION.
