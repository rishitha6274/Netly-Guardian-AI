import json
from datetime import datetime

LOG_FILE = "database/enforcement_log.json"


def log_enforcement(action):

    try:
        with open(LOG_FILE, "r") as file:
            logs = json.load(file)

    except FileNotFoundError:
        logs = []

    action["timestamp"] = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    logs.append(action)

    with open(LOG_FILE, "w") as file:
        json.dump(logs, file, indent=4)