from database.mongodb import events_collection


def save_event(event):

    events_collection.insert_one(event)


def get_events(user_id=None):

    query = {}

    if user_id:
        query["user_id"] = user_id

    events = []

    for event in events_collection.find(query):

        event["_id"] = str(event["_id"])

        events.append(event)

    return events