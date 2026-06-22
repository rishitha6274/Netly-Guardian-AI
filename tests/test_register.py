from scanner.auth import register_user

user = register_user(
    "Rishitha",
    "rishitha@gmail.com",
    "password123"
)

print(user)