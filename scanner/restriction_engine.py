import json
from datetime import datetime
from scanner.action_logger import log_action

RESTRICTED_FILE = "database/restricted_devices.json"


def load_restricted_devices():

    try:
        with open(RESTRICTED_FILE, "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return []


def save_restricted_devices(devices):

    with open(RESTRICTED_FILE, "w") as file:
        json.dump(devices, file, indent=4)


def restrict_device(mac, reason):

    devices = load_restricted_devices()

    mac = mac.lower()

    for device in devices:

        if device["mac"] == mac:
            return device

    entry = {
        "mac": mac,
        "reason": reason,
        "restricted_at": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    }

    devices.append(entry)

    save_restricted_devices(devices)

    log_action(
        "device_restricted",
        mac,
        reason
    )

    return entry
    


def remove_restriction(mac):

    devices = load_restricted_devices()

    mac = mac.lower()

    devices = [
        device
        for device in devices
        if device["mac"] != mac
    ]

    save_restricted_devices(devices)

    log_action(
        "restriction_removed",
        mac,
        "Restriction removed"
    )

    return {
        "mac": mac,
        "status": "restriction_removed"
    }