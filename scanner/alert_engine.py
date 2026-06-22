import json

from scanner.device_registry import get_all_known_devices


def generate_security_alerts():

    alerts = []

    # Current devices
    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    # Known devices from MongoDB
    known_devices = get_all_known_devices()

    known_macs = {
        device["mac"].lower()
        for device in known_devices
    }

    for device in devices:

        if device["mac"].lower() not in known_macs:

            alerts.append({
                "severity": "high",
                "type": "unknown_device",
                "message": f"Unknown device detected ({device['ip']})",
                "mac": device["mac"]
            })

    return alerts