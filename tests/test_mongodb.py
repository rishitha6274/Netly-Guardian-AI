from database.mongodb import users_collection

result = users_collection.insert_one({
    "name": "Mongo Test User",
    "email": "test@netly.ai"
})

print("Inserted ID:", result.inserted_id)