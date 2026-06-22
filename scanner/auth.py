import bcrypt
from datetime import datetime

from database.mongodb import users_collection



def register_user(name, email, password):

    existing_user = users_collection.find_one({
        "email": email.lower()
    })

    if existing_user:
        return None

    hashed_password = bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()

    user = {
        "name": name,
        "email": email.lower(),
        "password": hashed_password,
        "created_at": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    }

    result = users_collection.insert_one(user)

    user["_id"] = str(result.inserted_id)

    del user["password"]

    return user


def login_user(email, password):

    user = users_collection.find_one({
        "email": email.lower()
    })

    if not user:
        return None

    valid = bcrypt.checkpw(
        password.encode(),
        user["password"].encode()
    )

    if not valid:
        return None

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    }

from bson import ObjectId



def get_user_email(user_id):

    user = users_collection.find_one({
        "_id": ObjectId(user_id)
    })

    if not user:

        return None

    return user["email"]