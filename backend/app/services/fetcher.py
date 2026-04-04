import os
import certifi
import requests

import urllib3
from dotenv import load_dotenv

load_dotenv()

DISABLE_SSL_VERIFY = os.getenv("DISABLE_SSL_VERIFY", "false").lower() == "true"

if DISABLE_SSL_VERIFY:
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def fetch_html(url: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=10,
        # verify=certifi.where(),
        verify=not DISABLE_SSL_VERIFY,  # Disable SSL verification (not recommended for production)
    )
    response.raise_for_status()
    return response.text
