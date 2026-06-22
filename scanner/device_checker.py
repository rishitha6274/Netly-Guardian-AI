import json
from scanner.device_registry import get_all_known_devices


def load_known_devices():
    return get_all_known_devices()


def load_vendor_database():
    with open("database/mac_vendors.json", "r") as file:
        return json.load(file)


def get_vendor(mac, vendor_db):
    prefix = mac[:8].lower()
    return vendor_db.get(prefix, "Unknown Vendor")


def check_devices(devices, known_devices, vendor_db):

    known_macs = {}

    for device in known_devices:
        known_macs[device["mac"].lower()] = device["name"]

    print("\nDevice Status")
    print("=" * 40)

    for device in devices:

        mac = device["mac"].lower()

        vendor = get_vendor(mac, vendor_db)

        if mac in known_macs:
            print("✓ KNOWN DEVICE")
            print(f"  Name  : {known_macs[mac]}")
            print(f"  Vendor: {vendor}")
            print(f"  IP    : {device['ip']}")
            print(f"  MAC   : {device['mac']}")
        else:
            print("⚠ UNKNOWN DEVICE DETECTED")
            print(f"  Vendor: {vendor}")
            print(f"  IP    : {device['ip']}")
            print(f"  MAC   : {device['mac']}")

        print("-" * 40)