import os
import smtplib

def send_email(subject, body, recipient):

    print("STEP 1")

    sender = os.getenv("EMAIL_ADDRESS")
    password = os.getenv("EMAIL_APP_PASSWORD")

    print("STEP 2")

    server = smtplib.SMTP(
        "smtp.gmail.com",
        587,
        timeout=10
    )

    print("STEP 3")

    server.starttls()

    print("STEP 4")

    server.login(
        sender,
        password
    )

    print("STEP 5")

    server.quit()

    return True