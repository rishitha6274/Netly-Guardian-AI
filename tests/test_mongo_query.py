# tests/test_mongo_query.py

from database.mongodb import devices_collection

print("Connected")

doc = devices_collection.find_one()

print("Result:")
print(doc)