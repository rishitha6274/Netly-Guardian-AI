import json
from datetime import datetime


HISTORY_FILE = "database/security_history.json"


def save_security_score(score):

    entry = {
        "score": score,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    try:
        with open(HISTORY_FILE, "r") as file:
            history = json.load(file)

    except FileNotFoundError:
        history = []

    history.append(entry)

    with open(HISTORY_FILE, "w") as file:
        json.dump(history, file, indent=4)


def load_security_history():

    try:
        with open(HISTORY_FILE, "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return []