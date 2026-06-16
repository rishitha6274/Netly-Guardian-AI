import json

KNOWN_DEVICES_FILE = "database/known_devices.json"


def load_known_devices():

    with open(KNOWN_DEVICES_FILE, "r") as file:
        return json.load(file)


def save_known_devices(devices):

    with open(KNOWN_DEVICES_FILE, "w") as file:
        json.dump(devices, file, indent=4)


def register_device(name, owner, mac):

    devices = load_known_devices()

    new_device = {
        "name": name,
        "owner": owner,
        "mac": mac.lower(),
        "daily_limit_minutes": 0,
        "curfew_start": "",
        "curfew_end": ""
    }

    devices.append(new_device)

    save_known_devices(devices)

    return new_device