from database.device_model import (
    save_device,
    get_devices
)

device = {
    "name": "Test Device",
    "ip": "192.168.1.100",
    "mac": "AA:BB:CC:DD:EE:FF",
    "owner": "Rishitha",
    "online": True
}

print(
    save_device(device)
)

print(
    get_devices()
)