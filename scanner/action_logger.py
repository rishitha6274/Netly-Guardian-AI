import json
from datetime import datetime

ACTION_LOG_FILE = "database/action_log.json"


def load_actions():

    try:
        with open(ACTION_LOG_FILE, "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return []


def save_actions(actions):

    with open(ACTION_LOG_FILE, "w") as file:
        json.dump(actions, file, indent=4)


def log_action(action_type, device, details):

    actions = load_actions()

    entry = {
        "timestamp": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
        "type": action_type,
        "device": device,
        "details": details
    }

    actions.append(entry)

    save_actions(actions)

    return entry