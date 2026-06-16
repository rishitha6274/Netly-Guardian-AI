from flask import Flask, jsonify
import json
from scanner.limit_checker import check_limits
from flask import request
from scanner.device_registry import register_device

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
        known_macs[device["mac"].lower()] = device["name"]

    summary = []

    for device in devices:

        mac = device["mac"].lower()

        prefix = mac[:8]

        vendor = vendor_db.get(prefix, "Unknown Vendor")

        if mac in known_macs:
            name = known_macs[mac]
            status = "known"
        else:
            name = "Unknown Device"
            status = "unknown"

        summary.append({
            "name": name,
            "ip": device["ip"],
            "mac": device["mac"],
            "vendor": vendor,
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

if __name__ == "__main__":
    app.run(debug=True)