import json

from scanner.device_registry import get_all_known_devices


def calculate_trust_scores():

    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    known_devices = get_all_known_devices()

    known_macs = {
        device["mac"].lower(): device
        for device in known_devices
    }

    results = []

    for device in devices:

        mac = device["mac"].lower()

        if mac in known_macs:

            score = 100
            status = "Safe"

            owner = known_macs[mac]["owner"]

            name = known_macs[mac]["name"]

        else:

            score = 20
            status = "Suspicious"

            owner = "Unknown"
            name = "Unknown Device"

        results.append({
            "name": name,
            "owner": owner,
            "ip": device["ip"],
            "mac": device["mac"],
            "trust_score": score,
            "status": status
        })

    return results