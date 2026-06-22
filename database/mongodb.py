from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000
)

try:
    client.admin.command("ping")
    print("✅ Connected to MongoDB Atlas")
except Exception as e:
    print("❌ MongoDB Connection Failed")
    print(e)

db = client["netly"]

users_collection = db["users"]
devices_collection = db["devices"]
notifications_collection = db["notifications"]
events_collection = db["events"]
pairing_codes_collection = db["pairing_codes"]
scanners_collection = db["scanners"]
known_devices_collection = db["known_devices"]