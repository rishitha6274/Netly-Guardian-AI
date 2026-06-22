import json

from scanner.device_notes import load_notes
from scanner.device_blocker import load_blocked_devices
from scanner.restriction_engine import load_restricted_devices
from scanner.device_registry import get_all_known_devices


def get_device_profiles():

    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    known_devices = get_all_known_devices()

    with open("database/device_usage.json", "r") as file:
        usage_data = json.load(file)

    notes = load_notes()

    blocked_devices = load_blocked_devices()

    restricted_devices = load_restricted_devices()

    known_lookup = {}

    for device in known_devices:

        known_lookup[
            device["mac"].lower()
        ] = device

    profiles = []

    for device in devices:

        mac = device["mac"].lower()

        known = known_lookup.get(mac)

        is_blocked = mac in blocked_devices

        is_restricted = any(
            restricted["mac"] == mac
            for restricted in restricted_devices
        )

        if known:

            profile = {
                "name": known["name"],
                "owner": known["owner"],
                "ip": device["ip"],
                "mac": device["mac"],
                "daily_limit":
                    known["daily_limit_minutes"],
                "curfew_start":
                    known["curfew_start"],
                "curfew_end":
                    known["curfew_end"],
                "minutes_online":
                    usage_data.get(mac, {})
                    .get("minutes_online", 0),
                "note":
                    notes.get(mac, ""),
                "status": "known",
                "online": True,
                "blocked": is_blocked,
                "restricted": is_restricted
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
                "status": "unknown",
                "online": True,
                "blocked": is_blocked,
                "restricted": is_restricted
            }

        profiles.append(profile)

    return profiles