import json
from datetime import datetime

from scanner.security_score import (
    calculate_security_score
)


def generate_weekly_report():

    with open(
        "database/devices.json",
        "r"
    ) as file:

        devices = json.load(file)

    with open(
        "database/event_log.json",
        "r"
    ) as file:

        events = json.load(file)

    with open(
        "database/device_usage.json",
        "r"
    ) as file:

        usage = json.load(file)

    score = calculate_security_score()

    top_devices = sorted(
        usage.items(),
        key=lambda x:
        x[1]["minutes_online"],
        reverse=True
    )

    report = {
        "generated_at":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

        "total_devices":
            len(devices),

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