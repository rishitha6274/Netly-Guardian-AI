import time
import schedule

from reports.report_email import (
    send_weekly_report
)

from database.mongodb import (
    users_collection
)


def send_reports_to_all_users():

    users = users_collection.find()

    for user in users:

        email = user.get("email")

        if not email:
            continue

        try:

            result = send_weekly_report(
                email
            )

            print(
                f"Report sent to {email}"
            )

            print(result)

        except Exception as e:

            print(
                f"Failed for {email}: {e}"
            )


schedule.every().sunday.at("09:00").do(
    send_reports_to_all_users
)

print(
    "Weekly report scheduler started..."
)

while True:

    schedule.run_pending()

    time.sleep(60)