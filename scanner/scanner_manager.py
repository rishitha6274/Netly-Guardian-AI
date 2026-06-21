from datetime import datetime

from database.mongodb import (
    scanners_collection
)


def register_scanner(
    user_id,
    hostname
):

    scanner = {
        "user_id": user_id,
        "hostname": hostname,
        "paired_at": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
        "last_seen": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    }

    result = scanners_collection.insert_one(
        scanner
    )

    scanner["_id"] = str(
        result.inserted_id
    )

    return scanner


def get_scanners(user_id):

    scanners = []

    for scanner in scanners_collection.find({
        "user_id": user_id
    }):

        scanner["_id"] = str(
            scanner["_id"]
        )

        scanners.append(scanner)

    return scanners