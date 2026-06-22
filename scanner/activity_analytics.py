import json


def get_activity_analytics():

    try:
        with open("database/event_log.json", "r") as file:
            events = json.load(file)

    except FileNotFoundError:
        events = []

    joins = 0
    leaves = 0

    device_activity = {}

    for event in events:

        mac = event["mac"]

        if event["event"] == "device_joined":
            joins += 1

        if event["event"] == "device_left":
            leaves += 1

        device_activity[mac] = (
            device_activity.get(mac, 0) + 1
        )

    most_active_device = None
    most_activity = 0

    for mac, count in device_activity.items():

        if count > most_activity:

            most_activity = count
            most_active_device = mac

    return {
        "total_joins": joins,
        "total_leaves": leaves,
        "most_active_device": most_active_device,
        "activity_count": most_activity
    }