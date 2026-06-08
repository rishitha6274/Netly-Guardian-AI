import json

from network_scan import scan_network
from device_checker import (
    load_known_devices,
    load_vendor_database,
    check_devices
)


network = "192.168.1.0/24"

print(f"\nScanning network: {network}\n")

devices = scan_network(network)

with open("database/devices.json", "w") as file:
    json.dump(devices, file, indent=4)

print("Results saved to database/devices.json")

known_devices = load_known_devices()

vendor_db = load_vendor_database()

check_devices(devices, known_devices, vendor_db)