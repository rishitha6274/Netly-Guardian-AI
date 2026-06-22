import json

from scanner.curfew_checker import check_curfews
from scanner.limit_checker import check_limits
from scanner.score_history import save_security_score
from scanner.device_registry import get_all_known_devices

def calculate_security_score():

    score = 100

    # Load current devices
    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    # Load trusted devices from MongoDB
    known_devices = get_all_known_devices()

    # Build set of trusted MAC addresses
    known_macs = {
        device["mac"].lower()
        for device in known_devices
    }

    # Count unknown devices
    unknown_count = 0

    for device in devices:

        if device["mac"].lower() not in known_macs:
            unknown_count += 1

    # Other alerts
    curfew_alerts = check_curfews()

    limit_alerts = check_limits()

    # Deduct points

    # Unknown devices are highest risk
    score -= unknown_count * 10

    # Curfew violations
    score -= len(curfew_alerts) * 3

    # Screen time violations
    score -= len(limit_alerts) * 2

    # Prevent negative score
    if score < 0:
        score = 0

    # Security level

    if score >= 90:
        level = "Excellent"

    elif score >= 70:
        level = "Good"

    elif score >= 50:
        level = "Fair"

    else:
        level = "Poor"

    save_security_score(score)
    
    return {
        "score": score,
        "level": level,
        "unknown_devices": unknown_count,
        "curfew_alerts": len(curfew_alerts),
        "screen_time_alerts": len(limit_alerts)
    }