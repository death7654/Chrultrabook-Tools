#!/bin/sh

set -e

echo "Installing ectools and cbmem..."

base_url="https://github.com/death7654/chromium-tools/releases/download/chromium-tools"
tmp_dir="/tmp/chrultrabook-tools"

mkdir -p "$tmp_dir"

files="
chromium-ectool.deb
chromium-cbmem.deb
"

for file in $files; do
    echo "Downloading $file..."
    curl -L -o "$tmp_dir/$file" "$base_url/$file"
    echo "Installing $file..."
    dpkg -i "$tmp_dir/$file"
done

echo "Cleaning up..."
rm -rf "$tmp_dir"

exit 0
