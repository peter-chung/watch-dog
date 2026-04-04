from bs4 import BeautifulSoup


def extract_content(html: str, selector: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    element = soup.select_one(selector)

    if element is None:
        raise ValueError("No element found for the provided selector.")

    text = element.get_text(separator=" ", strip=True)

    if not text:
        raise ValueError("The selected element contains no text.")

    normalized = " ".join(text.split())

    return normalized
