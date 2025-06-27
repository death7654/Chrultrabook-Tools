%post

echo "Adding Terra repository and installing chromium-ectool and cbmem..."

# Wait for DNF/YUM lock to be released
echo "Checking if package manager is busy..."
while fuser /var/cache/dnf/metadata_lock.pid >/dev/null 2>&1 || \
      fuser /var/run/yum.pid >/dev/null 2>&1; do
    echo "Waiting for other package operations to complete..."
    sleep 3
done

# Add the Terra repo
sudo dnf install --nogpgcheck --repofrompath 'terra,https://repos.fyralabs.com/terra$releasever' terra-release -y

# Install the tools
sudo dnf install -y chromium-ectool cbmem || echo "Installation failed or already installed"

exit 0
