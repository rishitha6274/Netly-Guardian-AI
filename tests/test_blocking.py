from scanner.device_blocker import (
    block_device,
    unblock_device,
    load_blocked_devices
)

print("\nBlocking Device\n")

print(
    block_device(
        "80:84:89:9e:de:5f"
    )
)

print(
    load_blocked_devices()
)

print("\nUnblocking Device\n")

print(
    unblock_device(
        "80:84:89:9e:de:5f"
    )
)

print(
    load_blocked_devices()
)