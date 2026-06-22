from scanner.device_registry import get_all_known_devices


def get_mac_by_name(device_name):

    devices = get_all_known_devices()

    for device in devices:

        if device["name"] == device_name:
            return device["mac"]

    return None