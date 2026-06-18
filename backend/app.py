from flask import Flask, jsonify
import json
from scanner.limit_checker import check_limits
from flask import request
from scanner.device_registry import (
    register_device,
    rename_device,
    set_limit
)
from scanner.device_registry import set_curfew
from scanner.alert_engine import generate_security_alerts
from scanner.curfew_checker import check_curfews
from scanner.device_notes import add_note
from scanner.device_notes import load_notes
from scanner.security_score import calculate_security_score
from scanner.device_trust import calculate_trust_scores
from scanner.score_history import load_security_history
from scanner.activity_analytics import get_activity_analytics
from scanner.device_profiles import get_device_profiles
from scanner.notification_engine import get_notifications

app = Flask(__name__)


@app.route("/")
def home():
    return {
        "message": "Netly API Running",
        "status": "success"
    }


@app.route("/devices")
def get_devices():

    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    return jsonify(devices)


@app.route("/events")
def get_events():

    with open("database/event_log.json", "r") as file:
        events = json.load(file)

    return jsonify(events)


@app.route("/device-summary")
def device_summary():

    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    with open("database/known_devices.json", "r") as file:
        known_devices = json.load(file)

    with open("database/mac_vendors.json", "r") as file:
        vendor_db = json.load(file)

    known_macs = {}

    for device in known_devices:
        known_macs[device["mac"].lower()] = {
            "name": device["name"],
            "owner": device["owner"]
        }

    summary = []

    for device in devices:

        mac = device["mac"].lower()

        prefix = mac[:8]

        vendor = vendor_db.get(prefix, "Unknown Vendor")

        if mac in known_macs:

            name = known_macs[mac]["name"]
            owner = known_macs[mac]["owner"]

            status = "known"

        else:

            name = "Unknown Device"
            owner = "Unknown"

            status = "unknown"

        summary.append({
            "name": name,
            "ip": device["ip"],
            "mac": device["mac"],
            "vendor": vendor,
            "owner": owner,
            "status": status
        })

    return jsonify(summary)

@app.route("/dashboard")
def dashboard():

    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    with open("database/known_devices.json", "r") as file:
        known_devices = json.load(file)

    with open("database/event_log.json", "r") as file:
        events = json.load(file)

    known_macs = {
        device["mac"].lower()
        for device in known_devices
    }

    known_count = 0
    unknown_count = 0

    for device in devices:

        if device["mac"].lower() in known_macs:
            known_count += 1
        else:
            unknown_count += 1

    return jsonify({
        "total_devices": len(devices),
        "known_devices": known_count,
        "unknown_devices": unknown_count,
        "recent_events": len(events)
    })

@app.route("/usage")
def get_usage():

    with open("database/device_usage.json", "r") as file:
        usage = json.load(file)

    return jsonify(usage)

@app.route("/alerts")
def get_alerts():

    alerts = check_limits()

    return jsonify(alerts)

@app.route("/trust-device", methods=["POST"])
def trust_device():

    data = request.json

    device = register_device(
        data["name"],
        data["owner"],
        data["mac"]
    )

    return jsonify({
        "message": "Device registered successfully",
        "device": device
    })

@app.route("/rename-device", methods=["POST"])
def rename_known_device():

    data = request.json

    device = rename_device(
        data["mac"],
        data["name"]
    )

    if not device:
        return jsonify({
            "error": "Device not found"
        }), 404

    return jsonify({
        "message": "Device renamed",
        "device": device
    })

@app.route("/set-limit", methods=["POST"])
def set_screen_limit():

    data = request.json

    device = set_limit(
        data["mac"],
        data["limit"]
    )

    if not device:
        return jsonify({
            "error": "Device not found"
        }), 404

    return jsonify({
        "message": "Limit updated",
        "device": device
    })

@app.route("/set-curfew", methods=["POST"])
def update_curfew():

    data = request.json

    device = set_curfew(
        data["mac"],
        data["start"],
        data["end"]
    )

    if not device:
        return jsonify({
            "error": "Device not found"
        }), 404

    return jsonify({
        "message": "Curfew updated",
        "device": device
    })

@app.route("/security-alerts")
def security_alerts():

    alerts = generate_security_alerts()

    return jsonify(alerts)

@app.route("/curfew-alerts")
def curfew_alerts():

    alerts = check_curfews()

    return jsonify(alerts)

@app.route("/add-note", methods=["POST"])
def save_device_note():

    data = request.json

    result = add_note(
        data["mac"],
        data["note"]
    )

    return jsonify({
        "message": "Note saved",
        "data": result
    })

@app.route("/notes")
def get_notes():

    notes = load_notes()

    return jsonify(notes)


@app.route("/security-score")
def security_score():

    result = calculate_security_score()

    return jsonify(result)

@app.route("/trust-scores")
def trust_scores():

    return jsonify(
        calculate_trust_scores()
    )

@app.route("/security-history")
def security_history():

    return jsonify(
        load_security_history()
    )

@app.route("/activity")
def activity():

    return jsonify(
        get_activity_analytics()
    )

@app.route("/device-profiles")
def device_profiles():

    return jsonify(
        get_device_profiles()
    )

@app.route("/notifications")
def notifications():

    return jsonify(
        get_notifications()
    )

if __name__ == "__main__":
    app.run(debug=True)