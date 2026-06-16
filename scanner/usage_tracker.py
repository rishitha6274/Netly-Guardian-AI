import json
from datetime import datetime


USAGE_FILE = "database/device_usage.json"


def load_usage():

    try:
        with open(USAGE_FILE, "r") as file:
            return json.load(file)

    except:
        return {}


def save_usage(data):

    with open(USAGE_FILE, "w") as file:
        json.dump(data, file, indent=4)


def update_usage(devices):

    usage_data = load_usage()

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for device in devices:

        mac = device["mac"]

        if mac not in usage_data:

            usage_data[mac] = {
                "minutes_online": 0,
                "last_seen": current_time
            }

        usage_data[mac]["minutes_online"] += 1
        usage_data[mac]["last_seen"] = current_time

    save_usage(usage_data)

    return usage_data