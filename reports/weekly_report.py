import json
from datetime import datetime

from scanner.security_score import (
    calculate_security_score
)


def generate_weekly_report():

    try:
        with open(
            "database/devices.json",
            "r"
        ) as file:
            devices = json.load(file)
    except:
        devices = []

    try:
        with open(
            "database/event_log.json",
            "r"
        ) as file:
            events = json.load(file)
    except:
        events = []

    try:
        with open(
            "database/device_usage.json",
            "r"
        ) as file:
            usage = json.load(file)
    except:
        usage = {}

    score = calculate_security_score()

    known_devices = 0
    unknown_devices = 0

    for device in devices:

        if device.get("name") == "Unknown Device":
            unknown_devices += 1
        else:
            known_devices += 1

    top_devices = sorted(
        usage.items(),
        key=lambda x: x[1].get(
            "minutes_online",
            0
        ),
        reverse=True
    )

    report = {
        "generated_at":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

        "total_devices":
            len(devices),

        "known_devices":
            known_devices,

        "unknown_devices":
            unknown_devices,

        "total_events":
            len(events),

        "security_score":
            score["score"],

        "security_level":
            score["level"],

        "top_usage_devices":
            top_devices[:5]
    }

    return report