import json
import time
from datetime import datetime

from network_scan import scan_network
from usage_tracker import update_usage
from scanner.notification_engine import add_notification

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

    try:
        with open("database/known_devices.json", "r") as file:
            known_devices = json.load(file)

        return {
            device["mac"].lower()
            for device in known_devices
        }

    except FileNotFoundError:
        return set()


def log_event(event_type, device):

    event = {
        "event": event_type,
        "ip": device["ip"],
        "mac": device["mac"],
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    try:
        with open("database/event_log.json", "r") as file:
            events = json.load(file)

    except FileNotFoundError:
        events = []

    events.append(event)

    with open("database/event_log.json", "w") as file:
        json.dump(events, file, indent=4)

    print(f"\n[{event['timestamp']}] {event_type.upper()}")
    print(f"IP : {device['ip']}")
    print(f"MAC: {device['mac']}")


def monitor_network():

    previous_devices = load_previous_devices()

    while True:

        print("\nScanning...")

        current_devices = scan_network(NETWORK)

        update_usage(current_devices)
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

                log_event("device_joined", device)

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

        # Devices left
        for device in previous_devices:

            if device["mac"] not in current_macs:

                log_event("device_left", device)

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