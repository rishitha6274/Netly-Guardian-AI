from database.mongodb import db

devices_collection = db["devices"]


def save_device(device_data):

    existing = devices_collection.find_one({
        "user_id": device_data["user_id"],
        "mac": device_data["mac"]
    })

    if existing:

        devices_collection.update_one(
            {
                "user_id": device_data["user_id"],
                "mac": device_data["mac"]
            },
            {
                "$set": device_data
            }
        )

        return "updated"

    devices_collection.insert_one(
        device_data
    )

    return "created"


def get_devices(user_id=None):

    devices = []

    query = {}

    if user_id:
        query["user_id"] = user_id

    for device in devices_collection.find(query):

        device["_id"] = str(device["_id"])

        devices.append(device)

    return devices