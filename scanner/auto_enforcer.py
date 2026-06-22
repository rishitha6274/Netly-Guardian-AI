import json

from scanner.limit_checker import check_limits
from scanner.curfew_checker import check_curfews
from scanner.restriction_engine import restrict_device
from scanner.notification_engine import add_notification
from scanner.device_lookup import get_mac_by_name
from scanner.enforcement_logger import log_enforcement

def enforce_rules():

    actions = []

    # Screen time violations
    for alert in check_limits():

        device_name = alert["name"]

        add_notification(
            "Screen Time Limit Exceeded",
            f"{device_name} exceeded usage limit",
            "high"
        )

        mac = get_mac_by_name(device_name)

        if mac:

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

        add_notification(
            "Curfew Active",
            f"{device_name} is inside curfew hours",
            "medium"
        )

        mac = get_mac_by_name(device_name)

        if mac:

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