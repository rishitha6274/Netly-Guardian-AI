from datetime import datetime

from scanner.restriction_engine import (
    load_restricted_devices,
    remove_restriction
)
from scanner.device_registry import get_all_known_devices


def check_expired_restrictions():

    removed = []

    known_devices = get_all_known_devices()

    restricted = load_restricted_devices()

    current_time = datetime.now().strftime("%H:%M")

    for device in known_devices:

        mac = device["mac"].lower()

        curfew_end = device.get(
            "curfew_end",
            ""
        )

        if not curfew_end:
            continue

        if current_time >= curfew_end:

            for restricted_device in restricted:

                if restricted_device["mac"] == mac:

                    remove_restriction(mac)

                    removed.append(mac)

    return removed