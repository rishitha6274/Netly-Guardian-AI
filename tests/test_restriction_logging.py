from scanner.restriction_engine import (
    restrict_device,
    remove_restriction
)

restrict_device(
    "AA:BB:CC:DD:EE:FF",
    "Curfew Active"
)

remove_restriction(
    "AA:BB:CC:DD:EE:FF"
)

print("Restriction logging test complete") 