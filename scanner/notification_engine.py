import json
from datetime import datetime
from database.notification_model import (
    save_notification
)
from scanner.scanner_config import (
    load_scanner_config
)

NOTIFICATIONS_FILE = "database/notifications.json"


def load_notifications():

    try:
        with open(NOTIFICATIONS_FILE, "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return []


def save_notifications(notifications):

    with open(NOTIFICATIONS_FILE, "w") as file:
        json.dump(notifications, file, indent=4)


def add_notification(title, message, severity):

    notifications = load_notifications()

    notification = {
        "id": len(notifications) + 1,
        "title": title,
        "message": message,
        "severity": severity,
        "read": False,
        "timestamp": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    }
    config = load_scanner_config()

    mongo_notification = {
        "user_id": config["user_id"],
        "scanner_id": config["scanner_id"],
        "title": title,
        "message": message,
        "severity": severity,
        "read": False,
        "timestamp": notification["timestamp"]
    }

    save_notification(
    mongo_notification
    )

    notifications.append(notification)

    save_notifications(notifications)

    return notification


def mark_as_read(notification_id):

    notifications = load_notifications()

    for notification in notifications:

        if notification.get("id") == notification_id:

            notification["read"] = True

            save_notifications(notifications)

            return notification

    return None


def clear_notifications():

    save_notifications([])


def unread_count():

    notifications = load_notifications()

    count = 0

    for notification in notifications:

        if not notification.get("read", False):
            count += 1

    return count