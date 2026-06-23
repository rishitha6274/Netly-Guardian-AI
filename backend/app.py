from flask import Flask, jsonify
from flask_cors import CORS
import json
from scanner.limit_checker import check_limits
from scanner.device_registry import get_all_known_devices
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
from scanner.notification_engine import (
    load_notifications,
    mark_as_read,
    clear_notifications,
    unread_count
)
from scanner.device_blocker import (
    block_device,
    unblock_device,
    load_blocked_devices
)
from scanner.restriction_engine import (
    restrict_device,
    remove_restriction
)
from reports.weekly_report import generate_weekly_report
from scanner.action_logger import load_actions
from scanner.action_stats import get_action_stats
from scanner.auth import (
    register_user,
    login_user
)
from scanner.jwt_handler import generate_token
from scanner.auth_middleware import login_required
from scanner.pairing import (
    generate_pairing_code,
    verify_pairing_code
)
from flask import g
from scanner.scanner_manager import (
    register_scanner
)
from scanner.scanner_config import (
    save_scanner_config
)
from database.mongodb import devices_collection
from database.mongodb import events_collection
from scanner.email_service import send_email
from reports.report_email import (
    send_weekly_report
)


app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {
        "message": "Netly API Running",
        "status": "success"
    }


@app.route("/devices")
def get_devices():

    devices = []

    for device in devices_collection.find():

        device["_id"] = str(device["_id"])

        devices.append(device)

    return jsonify(devices)


@app.route("/events")
def get_events():

    events = []

    for event in events_collection.find():

        event["_id"] = str(event["_id"])

        events.append(event)

    return jsonify(events)


@app.route("/device-summary")
def device_summary():

    with open("database/devices.json", "r") as file:
        devices = json.load(file)

    known_devices = get_all_known_devices()

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

    known_devices = get_all_known_devices()

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
@login_required
def device_profiles():

    return jsonify(
        get_device_profiles()
    )

@app.route("/notifications")
def notifications():

    return jsonify(
        load_notifications()
    )


@app.route("/notifications/unread-count")
def notifications_unread():

    return jsonify({
        "unread":
        unread_count()
    })


@app.route(
    "/notifications/read",
    methods=["POST"]
)
def read_notification():

    data = request.json

    notification = mark_as_read(
        data["id"]
    )

    if not notification:

        return jsonify({
            "error":
            "Notification not found"
        }), 404

    return jsonify({
        "message":
        "Notification marked read",
        "notification":
        notification
    })

@app.route(
    "/notifications/clear",
    methods=["POST"]
)
def clear_all_notifications():

    clear_notifications()

    return jsonify({
        "message":
        "Notifications cleared"
    })

@app.route("/blocked-devices")
def blocked_devices():

    return jsonify(
        load_blocked_devices()
    )

@app.route("/block-device", methods=["POST"])
def api_block_device():

    data = request.json

    result = block_device(
        data["mac"]
    )

    return jsonify(result)

@app.route("/unblock-device", methods=["POST"])
def api_unblock_device():

    data = request.json

    result = unblock_device(
        data["mac"]
    )

    return jsonify(result)

@app.route("/restrict-device", methods=["POST"])
def api_restrict_device():

    data = request.json

    result = restrict_device(
        data["mac"],
        data.get("reason", "Restricted by administrator")
    )

    return jsonify(result)


@app.route("/unrestrict-device", methods=["POST"])
def api_unrestrict_device():

    data = request.json

    result = remove_restriction(
        data["mac"]
    )

    return jsonify(result)


@app.route("/report")
def weekly_report():

    return jsonify(
        generate_weekly_report()
    )

@app.route("/test-report")
def test_report():

    result = send_weekly_report(
        "netlygaurdian@gmail.com"
    )

    return result

@app.route("/actions")
def get_actions():

    actions = load_actions()

    return jsonify(actions)

@app.route("/action-stats")
def action_stats():

    return jsonify(
        get_action_stats()
    )

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    user = register_user(
        data["name"],
        data["email"],
        data["password"]
    )

    if not user:

        return jsonify({
            "error": "Email already exists"
        }), 400

    return jsonify({
        "message": "User registered",
        "user": user
    })

@app.route("/login", methods=["POST"])
def login():

    data = request.json

    user = login_user(
        data["email"],
        data["password"]
    )

    if not user:

        return jsonify({
            "error": "Invalid credentials"
        }), 401

    token = generate_token(user)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user
    })

from flask import g

@app.route("/me")
@login_required
def me():

    return jsonify({
        "user_id": g.user["user_id"],
        "email": g.user["email"]
    })

@app.route(
    "/generate-pairing-code",
    methods=["POST"]
)
@login_required
def create_pairing_code():

    code = generate_pairing_code(
        g.user["user_id"]
    )

    return jsonify({
        "pairing_code": code
    })

@app.route(
    "/pair-scanner",
    methods=["POST"]
)
def pair_scanner():

    data = request.json

    user_id = verify_pairing_code(
        data["code"]
    )

    if not user_id:

        return jsonify({
            "error":
            "Invalid pairing code"
        }), 400

    scanner = register_scanner(
        user_id,
        data["hostname"]
    )

    save_scanner_config(
        user_id,
        scanner["_id"]
    )

    return jsonify({
        "message":
        "Scanner paired",
        "scanner":
        scanner
    })

import os

@app.route("/debug-mongo")
def debug_mongo():
    uri = os.getenv("MONGO_URI", "")

    return {
        "starts_with_srv": uri.startswith("mongodb+srv://"),
        "contains_cluster": "cluster0.xsvfrmm.mongodb.net" in uri,
        "length": len(uri)
    }

@app.route("/debug-email")
def debug_email():

    import os

    return {
        "email_exists": bool(os.getenv("EMAIL_ADDRESS")),
        "password_exists": bool(os.getenv("EMAIL_APP_PASSWORD"))
    }

@app.route("/test-email")
def test_email():

    result = send_email(
        subject="Netly Test Email",
        body="Congratulations! Netly email notifications are working.",
        recipient="netlygaurdian@gmail.com"
    )

    return result

if __name__ == "__main__":
    app.run(debug=True)