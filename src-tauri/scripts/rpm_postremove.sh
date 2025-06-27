%postun

echo "Removing chromium-ectool and cbmem..."

# Wait for DNF/YUM lock to be released
echo "Checking if package manager is busy..."
while fuser /var/cache/dnf/metadata_lock.pid >/dev/null 2>&1 || \
      fuser /var/run/yum.pid >/dev/null 2>&1; do
    echo "Waiting for other package operations to complete..."
    sleep 3
done

# Attempt to remove the packages
sudo dnf remove -y chromium-ectool cbmem || echo "Packages not found or already removed"

exit 0
