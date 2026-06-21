from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["netly"]

users_collection = db["users"]
devices_collection = db["devices"]
notifications_collection = db["notifications"]
events_collection = db["events"]
pairing_codes_collection = db["pairing_codes"]
scanners_collection = db["scanners"]

print("✅ Connected to MongoDB Atlas")