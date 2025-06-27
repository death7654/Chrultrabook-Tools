#!/bin/sh

set -e

echo "Removing chromium-ectool and chromium-cbmem..."

# Attempt to remove the installed tools
dpkg -r chromium-ectool || true
dpkg -r chromium-cbmem || true

# Optionally, clean up residual config files
dpkg --purge chromium-ectool || true
dpkg --purge chromium-cbmem || true

exit 0
