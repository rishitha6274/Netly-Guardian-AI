import json
from datetime import datetime

NOTIFICATION_FILE = "database/notifications.json"


def add_notification(title, message, severity):

    notification = {
        "title": title,
        "message": message,
        "severity": severity,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    try:
        with open(NOTIFICATION_FILE, "r") as file:
            notifications = json.load(file)

    except FileNotFoundError:
        notifications = []

    notifications.append(notification)

    with open(NOTIFICATION_FILE, "w") as file:
        json.dump(notifications, file, indent=4)

    return notification


def get_notifications():

    try:
        with open(NOTIFICATION_FILE, "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return []