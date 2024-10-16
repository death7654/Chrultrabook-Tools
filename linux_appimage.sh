#!/usr/bin/env bash 
ROOT=$(pwd)

if [[ -d $ROOT/target ]]; then
    APPIMAGEDIR="$ROOT/target/release/bundle/appimage"
elif [[ -d $ROOT/src-tauri/target ]]; then
    APPIMAGEDIR="$ROOT/src-tauri/target/release/bundle/appimage"
else
    echo "Error: target folder not found. Aborting" 
    exit 1
fi

APPDIR="$(find $APPIMAGEDIR -name "chrultrabook-tools*.AppDir")"
APPIMAGE="$(find $APPIMAGEDIR -name "chrultrabook-tools*.AppImage")"
APPIMAGETOOLURL="https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage"

if [[ -z $APPDIR ]] || [[ -z $APPIMAGE ]]; then
	echo "Error: Unable to find AppImage"
	exit 1
fi

# modify appimage to add our stuff
rm $APPIMAGE
cd $APPIMAGEDIR
cp $ROOT/Linux/AppRun $APPDIR
curl -L https://files.tree123.org/utils/x86_64/gnu/ectool -o $APPDIR/usr/bin/ectool
curl -L https://files.tree123.org/utils/x86_64/gnu/cbmem -o $APPDIR/usr/bin/cbmem
chmod +x $APPDIR/usr/bin/*
curl -L $APPIMAGETOOLURL -o AppImageTool.AppImage
chmod +x AppImageTool.AppImage
ARCH=x86_64 ./AppImageTool.AppImage $APPDIR $APPIMAGE
