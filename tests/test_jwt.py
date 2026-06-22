from scanner.jwt_handler import (
    generate_token,
    verify_token
)

user = {
    "id": "123",
    "email": "test@netly.ai"
}

token = generate_token(user)

print("TOKEN:")
print(token)

print()

print("VERIFY:")
print(
    verify_token(token)
)