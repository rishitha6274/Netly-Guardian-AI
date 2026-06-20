from scanner.restriction_engine import (
    restrict_device,
    load_restricted_devices,
    remove_restriction
)

print("\nAdd Restriction\n")

print(
    restrict_device(
        "80:84:89:9e:de:5f",
        "curfew"
    )
)

print(
    load_restricted_devices()
)

print("\nRemove Restriction\n")

print(
    remove_restriction(
        "80:84:89:9e:de:5f"
    )
)

print(
    load_restricted_devices()
)