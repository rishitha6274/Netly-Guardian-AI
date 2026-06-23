from reports.weekly_report import (
    generate_weekly_report
)

from scanner.email_service import (
    send_email
)


def send_weekly_report(recipient):

    report = generate_weekly_report()

    body = f"""
Netly Weekly Security Report

Generated:
{report['generated_at']}

Devices Summary
--------------------------
Total Devices: {report['total_devices']}
Known Devices: {report['known_devices']}
Unknown Devices: {report['unknown_devices']}

Security
--------------------------
Score: {report['security_score']}/100
Level: {report['security_level']}

Activity
--------------------------
Total Events: {report['total_events']}

Top Devices
--------------------------
"""

    for device_name, stats in report["top_usage_devices"]:

        minutes = stats.get(
            "minutes_online",
            0
        )

        body += (
            f"\n• {device_name}: "
            f"{minutes} minutes"
        )

    return send_email(
        subject="📊 Netly Weekly Security Report",
        body=body,
        recipient=recipient
    )