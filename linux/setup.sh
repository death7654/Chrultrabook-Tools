#!/bin/bash

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit
fi
echo "Starting Setup Process"
echo "creating directory"
mkdir -p /usr/local/bin/CrosEC
echo "created"
echo "downloading tools"
cd /usr/local/bin/CrosEC
curl -o ectool https://tree123.org/chrultrabook/utils/ectool
curl -o cbmem https://tree123.org/chrultrabook/utils/cbmem
echo "setting up tools"
sudo chmod u+s /usr/local/bin/CrosEC/ectool
sudo chmod u+s /usr/local/bin/CrosEC/cbmem
export PATH=/usr/local/bin/CrosEC/ectool:$PATH
export PATH=/usr/local/bin/CrosEC/cbmem:$PATH
source ~/.bashrc
echo "setup done"


