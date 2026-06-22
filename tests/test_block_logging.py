from scanner.device_blocker import (
    block_device,
    unblock_device
)

block_device(
    "11:22:33:44:55:66"
)

unblock_device(
    "11:22:33:44:55:66"
)

print("Block logging test complete")