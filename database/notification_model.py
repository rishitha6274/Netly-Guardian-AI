from database.mongodb import db

notifications_collection = db["notifications"]


def save_notification(notification_data):

    notifications_collection.insert_one(
        notification_data
    )


def get_notifications(user_id=None):

    query = {}

    if user_id:
        query["user_id"] = user_id

    notifications = []

    for notification in notifications_collection.find(query):

        notification["_id"] = str(notification["_id"])

        notifications.append(notification)

    return notifications