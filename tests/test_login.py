from scanner.auth import login_user

user = login_user(
    "rishitha@gmail.com",
    "password123"
)

print(user)