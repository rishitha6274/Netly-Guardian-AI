from database.event_model import (
    save_event,
    get_events
)

save_event({
    "user_id": "test123",
    "event": "device_joined",
    "ip": "192.168.1.50",
    "mac": "aa:bb:cc:dd:ee:ff"
})

print(get_events("test123"))