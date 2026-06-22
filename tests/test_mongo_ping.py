# tests/test_mongo_ping.py

from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

print(
    client.admin.command("ping")
)