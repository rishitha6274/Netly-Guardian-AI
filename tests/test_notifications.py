from scanner.notification_engine import (
    add_notification,
    unread_count
)

add_notification(
    "Test Notification",
    "Notification system working",
    "low"
)

print(
    "\nUnread:",
    unread_count()
)