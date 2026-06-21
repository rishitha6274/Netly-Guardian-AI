import random

from database.mongodb import (
    pairing_codes_collection
)


def generate_pairing_code(user_id):

    code = str(
        random.randint(
            100000,
            999999
        )
    )

    pairing_codes_collection.insert_one({
        "code": code,
        "user_id": user_id,
        "used": False
    })

    return code


def verify_pairing_code(code):

    pairing = pairing_codes_collection.find_one({
        "code": code,
        "used": False
    })

    if not pairing:
        return None

    pairing_codes_collection.update_one(
        {"_id": pairing["_id"]},
        {
            "$set": {
                "used": True
            }
        }
    )

    return pairing["user_id"]