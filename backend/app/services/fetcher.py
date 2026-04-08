import requests
import truststore

from dotenv import load_dotenv

load_dotenv()
truststore.inject_into_ssl()


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
    )
    response.raise_for_status()
    return response.text
