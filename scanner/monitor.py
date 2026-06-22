import json
import time
from datetime import datetime

from network_scan import scan_network
from usage_tracker import update_usage
from scanner.notification_engine import add_notification
from database.device_model import save_device
from scanner.scanner_config import (
    load_scanner_config
)
from database.event_model import save_event
from scanner.device_registry import get_all_known_devices
from scanner.email_service import send_email
from scanner.auth import get_user_email

NETWORK = "192.168.1.0/24"
SCAN_INTERVAL = 60


def load_previous_devices():

    try:
        with open("database/devices.json", "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return []


def save_current_devices(devices):

    with open("database/devices.json", "w") as file:
        json.dump(devices, file, indent=4)


def load_known_macs():

    known_devices = get_all_known_devices()

    return {
        device["mac"].lower()
        for device in known_devices
    }


def log_event(
    event_type,
    device,
    user_id,
    scanner_id
):

    event = {
        "user_id": user_id,
        "scanner_id": scanner_id,
        "event": event_type,
        "ip": device["ip"],
        "mac": device["mac"],
        "timestamp": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    }

    save_event(event)

    print(
        f"\n[{event['timestamp']}] "
        f"{event_type.upper()}"
    )

    print(f"IP : {device['ip']}")
    print(f"MAC: {device['mac']}")


def monitor_network():

    previous_devices = load_previous_devices()
    config = load_scanner_config()

    user_id = config["user_id"]
    scanner_id = config["scanner_id"]

    while True:

        print("\nScanning...")

        current_devices = scan_network(NETWORK)

        update_usage(current_devices)

        for device in current_devices:

            mongo_device = {
                "user_id": user_id,
                "scanner_id": scanner_id,
                "name": "Unknown Device",
                "owner": "Unknown",
                "ip": device["ip"],
                "mac": device["mac"],
                "online": True,
                "last_seen": datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
                )
            }
            print("DEBUG:", mongo_device)
            try:
                result = save_device(mongo_device)

                print(
                    f"{device['ip']} -> {result} -> {mongo_device['last_seen']}"
                )
            except Exception as e:
                print(f"Database error: {e}")

        from scanner.restriction_checker import (
            check_expired_restrictions
        )

        check_expired_restrictions()

        known_macs = load_known_macs()

        previous_macs = {
            device["mac"]
            for device in previous_devices
        }

        current_macs = {
            device["mac"]
            for device in current_devices
        }

        # New devices joined
        for device in current_devices:

            if device["mac"] not in previous_macs:

                log_event(
                    "device_joined",
                    device,
                    user_id,
                    scanner_id
                )

                if device["mac"].lower() in known_macs:

                    add_notification(
                        "Known Device Joined",
                        f"{device['ip']} joined network",
                        "low"
                    )

                else:

                    add_notification(
                        "Unknown Device",
                        f"{device['ip']} joined network",
                        "high"
                    )
                    try:
                        email = get_user_email(user_id)
                        if email:
                            send_email(
                                subject="🚨 Netly Security Alert",
                                body=(
                                    f"Unknown device detected.\n\n"
                                    f"IP: {device['ip']}\n"
                                    f"MAC: {device['mac']}"
                                ),
                                recipient="netlygaurdian@gmail.com"
                            )
                    except Exception as e:
                        print(f"Error sending email: {e}")

        # Devices left
        for device in previous_devices:

            if device["mac"] not in current_macs:

                log_event(
                    "device_left",
                    device,
                    user_id,
                    scanner_id
                )
                add_notification(
                    "Device Left",
                    f"{device['ip']} left network",
                    "low"
                )

        save_current_devices(current_devices)

        previous_devices = current_devices

        print("Monitoring active...")

        time.sleep(SCAN_INTERVAL)

        

if __name__ == "__main__":
    monitor_network()
