from scanner.notification_engine import add_notification

notification = add_notification(
    "Unknown Device",
    "A new device joined the network",
    "high"
)

print(notification)