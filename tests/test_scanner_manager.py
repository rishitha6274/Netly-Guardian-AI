from scanner.scanner_manager import (
    register_scanner,
    get_scanners
)

register_scanner(
    "test_user_123",
    "Rishithas-MacBook-Air"
)

print(
    get_scanners(
        "test_user_123"
    )
)