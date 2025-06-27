#!/bin/sh

set -e

echo "Installing ectools and cbmem..."

base_url="https://github.com/death7654/chromium-tools/releases/download/chromium-tools"
tmp_dir="/tmp/chrultrabook-tools"

mkdir -p "$tmp_dir"

# Wait for dpkg lock to be released
echo "Checking if package manager is busy..."
echo "Checking if package manager is busy..."
while fuser /var/lib/dpkg/lock >/dev/null 2>&1 || \
      fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 || \
      fuser /var/lib/apt/lists/lock >/dev/null 2>&1 || \
      fuser /var/cache/apt/archives/lock >/dev/null 2>&1; do
    echo "Waiting for package manager to finish (dpkg/apt)..."
    sleep 3
done

files="
chromium-ectool.deb
chromium-cbmem.deb
"

for file in $files; do
    echo "Downloading $file..."
    curl -L -o "$tmp_dir/$file" "$base_url/$file"
    echo "Installing $file..."
    sudo apt install "$tmp_dir/$file"
done

echo "Cleaning up..."
rm -rf "$tmp_dir"

echo "Installation completed successfully."

exit 0
