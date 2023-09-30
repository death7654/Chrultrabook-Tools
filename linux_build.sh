#!/bin/bash 

# build as normal first
npm run tauri build

ROOT=$(pwd)
APPIMAGEDIR="$ROOT/src-tauri/target/release/bundle/appimage"
APPDIR="$(find $APPIMAGEDIR -name "chrultrabook-controller*.AppDir")"
APPIMAGE="$(find $APPIMAGEDIR -name "chrultrabook-controller*.AppImage")"
APPIMAGETOOLURL="https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage"

# modify appimage to add our stuff
rm $APPIMAGE
cd $APPIMAGEDIR
cp $ROOT/linux/AppRun $APPDIR
curl -L https://tree123.org/chrultrabook/utils/ectool -o $APPDIR/usr/bin/ectool
curl -L https://tree123.org/chrultrabook/utils/cbmem -o $APPDIR/usr/bin/cbmem
chmod +x $APPDIR/usr/bin/*
curl -L $APPIMAGETOOLURL -o AppImageTool.AppImage
chmod +x AppImageTool.AppImage
ARCH=x86_64 ./AppImageTool.AppImage $APPDIR $APPIMAGE
