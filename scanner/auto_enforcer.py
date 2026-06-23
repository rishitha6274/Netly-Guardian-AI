from scanner.limit_checker import check_limits
from scanner.curfew_checker import check_curfews
from scanner.restriction_engine import (
    restrict_device,
    load_restricted_devices
)
from scanner.notification_engine import add_notification
from scanner.device_lookup import get_mac_by_name
from scanner.enforcement_logger import log_enforcement


def is_already_restricted(mac):

    restricted = load_restricted_devices()

    for device in restricted:

        if device["mac"].lower() == mac.lower():
            return True

    return False


def enforce_rules():

    actions = []

    # Screen time violations
    for alert in check_limits():

        device_name = alert["name"]

        mac = get_mac_by_name(device_name)

        if not mac:
            continue

        # Skip if already restricted
        if is_already_restricted(mac):
            continue

        add_notification(
            "Screen Time Limit Exceeded",
            f"{device_name} exceeded usage limit",
            "high"
        )

        restrict_device(
            mac,
            "screen_time"
        )

        action = {
            "type": "screen_time_block",
            "device": device_name,
            "mac": mac
        }

        actions.append(action)

        log_enforcement(action)

    # Curfew violations
    for alert in check_curfews():

        device_name = alert["device"]

        mac = get_mac_by_name(device_name)

        if not mac:
            continue

        # Skip if already restricted
        if is_already_restricted(mac):
            continue

        add_notification(
            "Curfew Active",
            f"{device_name} is inside curfew hours",
            "medium"
        )

        restrict_device(
            mac,
            "curfew"
        )

        action = {
            "type": "curfew_block",
            "device": device_name,
            "mac": mac
        }

        actions.append(action)

        log_enforcement(action)

    return actions