%post

echo "Adding Terra repository and installing chromium-ectool and chromium-cbmem..."

# Add the Terra repo
sudo dnf install --nogpgcheck --repofrompath 'terra,https://repos.fyralabs.com/terra$releasever' terra-release -y

# Install the tools
sudo dnf install -y chromium-ectool cbmem || echo "Installation failed or already installed"

exit 0
