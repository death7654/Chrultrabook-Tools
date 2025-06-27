#!/bin/sh

set -e

echo "Removing chromium-ectool and chromium-cbmem..."

# Wait for dpkg/apt locks to be released
echo "Checking if package manager is busy..."
while fuser /var/lib/dpkg/lock >/dev/null 2>&1 || \
      fuser /var/lib/apt/lists/lock >/dev/null 2>&1 || \
      fuser /var/cache/apt/archives/lock >/dev/null 2>&1; do
    echo "Waiting for other package operations to complete..."
    sleep 3
done

# Attempt to remove the installed tools
dpkg -r chromium-ectool || true
dpkg -r chromium-cbmem || true

# Optionally, clean up residual config files
dpkg --purge chromium-ectool || true
dpkg --purge chromium-cbmem || true

echo "Removal complete."

exit 0
