import os
import requests


def send_email(subject, body, recipient):

    api_key = os.getenv("RESEND_API_KEY")

    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "from": "onboarding@resend.dev",
            "to": recipient,
            "subject": subject,
            "text": body
        }
    )

    return response.json()