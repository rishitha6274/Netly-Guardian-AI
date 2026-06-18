import json


def calculate_trust_scores():

    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    with open("database/known_devices.json", "r") as file:
        known_devices = json.load(file)

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