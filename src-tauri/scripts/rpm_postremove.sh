%postun

echo "Removing chromium-ectool and chromium-cbmem..."

sudo dnf remove -y chromium-ectool cbmem || echo "Packages not found or already removed"

exit 0
