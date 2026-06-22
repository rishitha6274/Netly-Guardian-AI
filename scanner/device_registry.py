import json
import os
from database.mongodb import known_devices_collection

KNOWN_DEVICES_FILE = "database/known_devices.json"


def seed_from_json():
    """One-time migrate: seed MongoDB from JSON file if collection is empty."""
    if known_devices_collection.count_documents({}) == 0:
        try:
            with open(KNOWN_DEVICES_FILE, "r") as f:
                devices = json.load(f)
            if devices:
                known_devices_collection.insert_many(devices)
                print(f"✅ Seeded {len(devices)} known devices into MongoDB")
        except (FileNotFoundError, json.JSONDecodeError):
            pass


def get_all_known_devices():
    """Return all known devices as a list (same format as JSON file)."""
    return list(known_devices_collection.find({}, {"_id": 0}))


def load_known_devices():
    """Backward-compatible alias."""
    return get_all_known_devices()


def save_known_devices(devices):
    """Replace entire known_devices collection (backward-compatible)."""
    known_devices_collection.delete_many({})
    if devices:
        known_devices_collection.insert_many(devices)


def register_device(name, owner, mac):
    mac = mac.lower()

    existing = known_devices_collection.find_one(
        {"mac": mac},
        {"_id": 0}
    )
    if existing:
        return existing

    new_device = {
        "name": name,
        "owner": owner,
        "mac": mac,
        "daily_limit_minutes": 0,
        "curfew_start": "",
        "curfew_end": ""
    }

    known_devices_collection.insert_one(new_device)
    return new_device


def rename_device(mac, new_name):
    result = known_devices_collection.find_one_and_update(
        {"mac": mac.lower()},
        {"$set": {"name": new_name}},
        projection={"_id": 0}
    )
    return result


def set_limit(mac, limit):
    result = known_devices_collection.find_one_and_update(
        {"mac": mac.lower()},
        {"$set": {"daily_limit_minutes": limit}},
        projection={"_id": 0}
    )
    return result


def set_curfew(mac, start_time, end_time):
    result = known_devices_collection.find_one_and_update(
        {"mac": mac.lower()},
        {"$set": {"curfew_start": start_time, "curfew_end": end_time}},
        projection={"_id": 0}
    )
    return result


# Auto-seed on import
seed_from_json()
