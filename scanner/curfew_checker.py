import json
from datetime import datetime


def check_curfews():

    alerts = []

    with open("database/known_devices.json", "r") as file:
        devices = json.load(file)

    current_time = datetime.now().strftime("%H:%M")

    for device in devices:

        start = device.get("curfew_start", "")
        end = device.get("curfew_end", "")

        if not start or not end:
            continue

        if start <= current_time or current_time <= end:

            alerts.append({
                "type": "curfew_active",
                "device": device["name"],
                "owner": device["owner"],
                "message": f"{device['name']} is inside curfew hours"
            })

    return alerts