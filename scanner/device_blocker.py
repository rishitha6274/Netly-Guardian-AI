import json
from scanner.action_logger import log_action

BLOCKED_FILE = "database/blocked_devices.json"


def load_blocked_devices():

    try:
        with open(BLOCKED_FILE, "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return []


def save_blocked_devices(devices):

    with open(BLOCKED_FILE, "w") as file:
        json.dump(devices, file, indent=4)


def block_device(mac):

    blocked = load_blocked_devices()

    mac = mac.lower()

    if mac not in blocked:

        blocked.append(mac)

        save_blocked_devices(blocked)

        log_action(
            "device_blocked",
            mac,
            "Device blocked"
        )

    return {
        "mac": mac,
        "status": "blocked"
    }


def unblock_device(mac):

    blocked = load_blocked_devices()

    mac = mac.lower()

    if mac in blocked:

        blocked.remove(mac)

        save_blocked_devices(blocked)

        log_action(
            "device_unblocked",
            mac,
            "Block removed"
        )

    return {
        "mac": mac,
        "status": "unblocked"
    }


def is_blocked(mac):

    blocked = load_blocked_devices()

    return mac.lower() in blocked