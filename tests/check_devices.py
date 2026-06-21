# tests/check_devices.py

from database.mongodb import devices_collection

devices = list(devices_collection.find())

print(f"Total devices: {len(devices)}")

for d in devices:
    print(d)