import json

from scanner.device_notes import load_notes


def get_device_profiles():

    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    with open("database/known_devices.json", "r") as file:
        known_devices = json.load(file)

    with open("database/device_usage.json", "r") as file:
        usage_data = json.load(file)

    notes = load_notes()

    known_lookup = {}

    for device in known_devices:

        known_lookup[
            device["mac"].lower()
        ] = device

    profiles = []

    for device in devices:

        mac = device["mac"].lower()

        known = known_lookup.get(mac)

        if known:

            profile = {
                "name": known["name"],
                "owner": known["owner"],
                "ip": device["ip"],
                "mac": device["mac"],
                "daily_limit": known["daily_limit_minutes"],
                "curfew_start": known["curfew_start"],
                "curfew_end": known["curfew_end"],
                "minutes_online":
                    usage_data.get(mac, {})
                    .get("minutes_online", 0),
                "note":
                    notes.get(mac, ""),
                "status": "known"
            }

        else:

            profile = {
                "name": "Unknown Device",
                "owner": "Unknown",
                "ip": device["ip"],
                "mac": device["mac"],
                "daily_limit": 0,
                "curfew_start": "",
                "curfew_end": "",
                "minutes_online":
                    usage_data.get(mac, {})
                    .get("minutes_online", 0),
                "note":
                    notes.get(mac, ""),
                "status": "unknown"
            }

        profiles.append(profile)

    return profiles