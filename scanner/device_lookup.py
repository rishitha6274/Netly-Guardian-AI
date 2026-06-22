import json


def get_mac_by_name(device_name):

    with open("database/known_devices.json", "r") as file:
        devices = json.load(file)

    for device in devices:

        if device["name"] == device_name:
            return device["mac"]

    return None