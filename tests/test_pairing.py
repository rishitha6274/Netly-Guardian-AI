from scanner.pairing import (
    generate_pairing_code,
    verify_pairing_code
)

user_id = "test_user_123"

code = generate_pairing_code(
    user_id
)

print("CODE:", code)

linked_user = verify_pairing_code(
    code
)

print("USER:", linked_user)