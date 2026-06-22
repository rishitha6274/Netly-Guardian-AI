import json

from scanner.device_registry import get_all_known_devices


def check_limits():

    known_devices = get_all_known_devices()

    with open("database/device_usage.json", "r") as file:
        usage_data = json.load(file)

    alerts = []

    for device in known_devices:

        mac = device["mac"]

        limit = device.get("daily_limit_minutes", 0)

        if limit == 0:
            continue

        if mac in usage_data:

            usage = usage_data[mac]["minutes_online"]

            if usage >= limit:

                alerts.append({
                    "type": "screen_time_exceeded",
                    "name": device["name"],
                    "owner": device["owner"],
                    "usage": usage,
                    "limit": limit,
                    "message": f"{device['name']} exceeded daily limit ({usage}/{limit} mins)"
                })

    return alerts