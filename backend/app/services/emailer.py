import os

from dotenv import load_dotenv
import resend

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "Watchdog <onboarding@resend.dev>")


def send_change_email(
    to_email: str,
    tracker_url: str,
    selector: str,
    old_content: str,
    new_content: str,
):
    if not RESEND_API_KEY:
        raise RuntimeError("Missing RESEND_API_KEY in environment variables.")

    resend.api_key = RESEND_API_KEY

    params: resend.Emails.SendParams = {
        "from": RESEND_FROM_EMAIL,
        "to": [to_email],
        "subject": "Change detected for tracked page",
        "html": f"""
            <h2>Change detected</h2>
            <p><strong>URL:</strong> {tracker_url}</p>
            <p><strong>Selector:</strong> {selector}</p>
            <hr />
            <p><strong>Previous content:</strong></p>
            <pre>{old_content}</pre>
            <p><strong>New content:</strong></p>
            <pre>{new_content}</pre>
        """,
    }

    return resend.Emails.send(params)
